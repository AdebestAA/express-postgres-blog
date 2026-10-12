CREATE TABLE IF NOT EXISTS post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id SERIAL NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON post_images(post_id);
