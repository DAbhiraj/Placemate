import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadController = {
    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file provided" });
            }

            const file = req.file;
            const uploadDir = path.join(__dirname, '../uploads');
            
            // Ensure uploads directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Generate unique filename
            const uniqueFilename = `${Date.now()}-${file.originalname}`;
            const filepath = path.join(uploadDir, uniqueFilename);

            // Move file from temp to uploads
            fs.renameSync(file.path, filepath);

            // Return file info
            res.status(200).json({
                message: "File uploaded successfully",
                filename: uniqueFilename,
                url: `/uploads/${uniqueFilename}`,
                mimetype: file.mimetype,
                size: file.size
            });
        } catch (error) {
            console.error("Upload error:", error);
            res.status(500).json({ message: "Failed to upload file" });
        }
    }
};
