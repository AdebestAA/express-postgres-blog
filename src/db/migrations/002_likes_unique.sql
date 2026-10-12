ALTER TABLE likes ADD CONSTRAINT uq_likes_user_post UNIQUE (user_id, post_id);
ALTER TABLE likes ADD CONSTRAINT uq_likes_user_comment UNIQUE (user_id, comment_id);
