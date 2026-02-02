import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async uploadFile(file: Buffer, key: string): Promise<string> {
    const simulatedUrl = `https://s3.eu-west-1.amazonaws.com/sdthai-dev/${key}`;

    console.log(`[Storage] Simulated upload: ${key} (${file.length} bytes)`);

    return simulatedUrl;
  }

  async deleteFile(key: string): Promise<void> {
    console.log(`[Storage] Simulated delete: ${key}`);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const timestamp = Date.now();
    const signature = Buffer.from(`${key}-${timestamp}`).toString('base64');
    const simulatedSignedUrl = `https://s3.eu-west-1.amazonaws.com/sdthai-dev/${key}?signature=${signature}&expires=${expiresIn}`;

    console.log(`[Storage] Generated signed URL for: ${key}`);

    return simulatedSignedUrl;
  }

  async uploadSignature(signatureData: string, deliveryId: string): Promise<string> {
    const key = `signatures/${deliveryId}-${Date.now()}.png`;
    const buffer = Buffer.from(signatureData.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    return this.uploadFile(buffer, key);
  }

  async uploadDeliveryPhoto(photoData: string, deliveryId: string, index: number): Promise<string> {
    const key = `delivery-photos/${deliveryId}-${index}-${Date.now()}.jpg`;
    const buffer = Buffer.from(photoData.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    return this.uploadFile(buffer, key);
  }

  async uploadCategoryImage(imageData: Buffer, categoryId: string): Promise<string> {
    const key = `categories/${categoryId}-${Date.now()}.jpg`;

    return this.uploadFile(imageData, key);
  }

  async uploadProductImage(imageData: Buffer, productId: string, index: number): Promise<string> {
    const key = `products/${productId}-${index}-${Date.now()}.jpg`;

    return this.uploadFile(imageData, key);
  }
}
