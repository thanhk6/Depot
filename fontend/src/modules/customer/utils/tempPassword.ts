// Mật khẩu tạm ngẫu nhiên cho tài khoản đối tác/tài xế — trước đây mọi tài khoản dùng chung 1 mật khẩu cố định
// nằm sẵn trong bundle JS (BUG-014), ai tải file JS cũng biết mật khẩu ban đầu của mọi tài khoản.
export const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return 'Dp@' + Array.from(bytes, (b) => chars[b % chars.length]).join('');
};
