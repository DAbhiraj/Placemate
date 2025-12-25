import fs from 'fs';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const uploadController = {
    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file provided" });
            }

            const file = req.file;
            
            // Upload to Cloudinary
            const cloudinaryResult = await uploadToCloudinary(file.path, {
                folder: 'placemate/documents',
                resource_type: 'auto',
                public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}` // Remove extension
            });

            // Delete temporary file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            // Return file info
            res.status(200).json({
                message: "File uploaded successfully",
                filename: file.originalname,
                url: cloudinaryResult.url,
                public_id: cloudinaryResult.public_id,
                mimetype: file.mimetype,
                size: cloudinaryResult.bytes
            });
        } catch (error) {
            console.error("Upload error:", error);
            
            // Clean up temp file on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            res.status(500).json({ message: "Failed to upload file" });
        }
    }
};
