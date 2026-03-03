import os
import uuid
import logging
from urllib.parse import urlparse

from supabase import create_client, Client
from django.conf import settings

logger = logging.getLogger(__name__)


class SupabaseStorageService:
    def __init__(self):
        self.url = getattr(settings, "SUPABASE_URL", None)
        self.key = getattr(settings, "SUPABASE_KEY", None)
        self.bucket_name = getattr(settings, "SUPABASE_BUCKET", "images")

        if not self.url or not self.key:
            logger.warning("Supabase credentials not configured.")
            self.supabase = None
            return

        try:
            self.supabase: Client = create_client(self.url, self.key)
        except Exception as e:
            logger.error(f"Error initializing Supabase client: {e}")
            self.supabase = None

    # --------------------------------------------------
    # UPLOAD IMAGE
    # --------------------------------------------------
    def upload_image(self, file, folder="images"):
        if not self.supabase:
            raise RuntimeError("Supabase client not initialized.")

        if not file:
            raise ValueError("No file provided.")

        try:
            file_name = getattr(file, "name", "file")
            extension = os.path.splitext(file_name)[1] or ".jpg"

            unique_filename = f"{folder}/{uuid.uuid4()}{extension}"

            if hasattr(file, "seek"):
                file.seek(0)

            file_content = file.read()

            self.supabase.storage.from_(self.bucket_name).upload(
                path=unique_filename,
                file=file_content,
                file_options={
                    "content-type": getattr(file, "content_type", "image/jpeg")
                },
            )

            public_url = self.supabase.storage.from_(
                self.bucket_name
            ).get_public_url(unique_filename)

            # Compatible con diferentes versiones del SDK
            if isinstance(public_url, str):
                return public_url

            return getattr(public_url, "public_url", str(public_url))

        except Exception as e:
            logger.error(f"Error uploading file to Supabase: {e}")
            raise RuntimeError("Failed to upload image to Supabase.")

    # --------------------------------------------------
    # DELETE IMAGE
    # --------------------------------------------------
    def delete_image(self, file_url):
        if not self.supabase or not file_url:
            return

        try:
            parsed_url = urlparse(file_url)
            path_parts = parsed_url.path.split("/")

            # Buscar índice del bucket
            if self.bucket_name in path_parts:
                bucket_index = path_parts.index(self.bucket_name)
                file_path = "/".join(path_parts[bucket_index + 1:])

                if file_path:
                    self.supabase.storage.from_(self.bucket_name).remove([file_path])

        except Exception as e:
            logger.error(f"Error deleting image from Supabase: {e}")


# Instancia singleton reutilizable
supabase_storage = SupabaseStorageService()