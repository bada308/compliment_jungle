const PATTERNS = {
  email: /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/,
  password: /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()._-]{6,16}$/,
  nickname: /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,16}$/,
};

const ERROR_MESSAGES = {
  email: "이메일 형식을 확인해주세요.",
  password: "비밀번호는 영문, 숫자를 포함한 6~16자리여야 합니다.",
  nickname: "닉네임은 영문, 숫자, 한글을 포함한 2~16자리여야 합니다.",
};

const emailValidator = (email) => {
  return PATTERNS.email.test(email);
};
const passwordValidator = (password) => {
  return PATTERNS.password.test(password);
};
const nicknameValidator = (nickname) => {
  return PATTERNS.nickname.test(nickname);
};
