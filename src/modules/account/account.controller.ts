import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response } from "express";
import { r2 } from "../../configs/r2-config";
import pool from "../../configs/init-db";
import { success } from "zod";
import { updateUserDataType } from "../../validations/schemas";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
export const updageProfilePicsController = async (
  req: Request,
  res: Response,
) => {
  // validate it
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "no image uploaded" });
  }

  const allowedImageTypes = ["image/jpeg", "image/png"];
  // check file type
  //
  if (!allowedImageTypes.includes(req?.file?.mimetype)) {
    return res
      .status(400)
      .json({ success: false, message: "only jpeg and png are allowed" });
  }

  if (req.file && req.file?.size > MAX_FILE_SIZE) {
    return res.status(400).json({ success: false, message: "File tooo large" });
  }

  // upload pix to cloud fare
  try {
    const key = `${crypto.randomUUID()}-${req?.file?.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await r2.send(command);

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;

    // no add the key to the db

    const userEmail = req.user?.email;
    console.log(req.user, "user data");

    // so get user profile from db

    const getUserData = await pool.query(
      `SELECT * FROM users u WHERE u.email = $1`,
      [userEmail],
    );
    console.log(getUserData.rows[0], "user data from postgress");
    // check if user exist
    if (getUserData.rows.length < 1) {
      return res
        .status(406)
        .json({ success: false, message: "unable to perform operation" });
    }

    const data: { email: string } = getUserData.rows[0];
    // update user avatar column with the returned url

    await pool.query(
      `
        UPDATE users 
        SET avatar = $1
        WHERE email = $2
        `,
      [url, data.email],
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Unable to perform the operation at this time",
    });
  }

  // res.json({
  //   url,
  // });
};

export const updateUserDataController = async (
  req: Request<{}, {}, updateUserDataType>,
  res: Response,
) => {
  console.log(req.body);
  const data = req.body;

  const updates: string[] = [];
  const queryValues: string[] = [];

  try {
    // update profile

    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        queryValues.push(value);
        updates.push(`${key} = $${queryValues.length}`);
      }
    });
    queryValues.push(req.user?.email as string);
    // console.log("updates", updates);
    // console.log("values", queryValues);
    await pool.query(
      `
      UPDATE users
      SET ${updates.join(" , ")} 
      WHERE email = $${queryValues.length}
       `,
      [...queryValues],
    );
    // await pool.query(
    //   `
    //   UPDATE users
    //   SET {first_name = $1 , last_name = $2}
    //   WHERE email = $3
    //    `,
    //   [req.body.first_name, req.body.last_name, req.user?.email],
    // );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
};

export const getUserData = async (req: Request, res: Response) => {
  const userEmail = req.user?.email;

  try {
    const userData = await pool.query(
      `SELECT u.first_name,u.last_name,u.email,u.nickname,u.avatar FROM users u WHERE u.email = $1`,
      [userEmail],
    );

    return res.status(200).json({ success: true, data: userData.rows[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "something went wrong",
    });
  }
};
