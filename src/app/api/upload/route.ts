import { NextRequest, NextResponse } from 'next/server';
import { s3Client } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExtension = file.name.split('.').pop() || 'tmp';
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
            // Note: ACL 'public-read' requires the bucket to allow public ACLs.
            // Alternatively, omit ACL and use a Bucket Policy for public read access.
            // ACL: 'public-read', 
        });

        await s3Client.send(command);

        // Construct the public URL (assuming the bucket is public)
        const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        return NextResponse.json({ url: imageUrl }, { status: 200 });
    } catch (error) {
        console.error('Error uploading to S3:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}
