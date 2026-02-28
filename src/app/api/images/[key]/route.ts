import { NextRequest, NextResponse } from 'next/server';
import { s3Client } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: key,
        });

        const response = await s3Client.send(command);

        if (!response.Body) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const bytes = await response.Body.transformToByteArray();

        return new NextResponse(Buffer.from(bytes), {
            status: 200,
            headers: {
                'Content-Type': response.ContentType || 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('Error fetching image from S3:', error);
        if (error.name === 'NoSuchKey') {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
}
