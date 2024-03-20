function handleLogout() {
  if (!confirm("로그아웃 하시겠습니까?")) return;

  $.removeCookie("token");
  window.location.href = "/login";
}
