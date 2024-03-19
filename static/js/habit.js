$(document).ready(function () {
  $("#habitCreate").css("display", "none");
});

function handleToggle() {
  $("#habitCreate").toggle();
  if ($("#habitCreate").css("display") === "none") {
    $("#habitAddToggleText").text("추가하기");
  } else {
    $("#habitAddToggleText").text("접어두기");
  }
}
