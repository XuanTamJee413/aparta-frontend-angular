export const cloudinaryConfig = {
  cloudName: 'dez1lfvhm',
  uploadPreset: 'ml_default', // Sử dụng preset mặc định có sẵn
  apiKey: '971379744664751',
  apiSecret: '1kR72otNlcHe45O59acTE4ml3f0', // Chỉ dùng ở backend
  uploadUrl: 'https://api.cloudinary.com/v1_1/dez1lfvhm/image/upload'
};

export const cloudinaryUploadOptions = {
  cloudName: cloudinaryConfig.cloudName,
  uploadPreset: cloudinaryConfig.uploadPreset,
  folder: 'aparta-avatars', // Folder trong Cloudinary để lưu avatar
  transformation: {
    width: 300,
    height: 300,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto'
  }
};
