function handleClickCompliment(element) {
  const habit_id = element.getAttribute("key");

  if ($("#emojiSelector").length) {
    $("#emojiSelector").remove();
    $(`#complimentToggleButton${habit_id}`).text("칭찬하기");
    return;
  }

  // 2. 서버에 칭찬 내역을 요청합니다.
  $.ajax({
    type: "GET",
    url: `/compliments/${habit_id}`,
    success: function (response) {
      if (response["result"] != "success") {
        alert("칭찬 내역 조회 실패!");
        return;
      } else {
        if (response.msg === "로그인 정보가 존재하지 않습니다.") {
          alert("로그인 정보가 존재하지 않습니다.");
          location.href = "/login";
          return;
        }
      }

      let { icon_num } = response["data"];

      showEmojiSelector(habit_id, icon_num);
      $(`#complimentToggleButton${habit_id}`).text("접어두기");
    },
  });
}

function showEmojiSelector(habit_id, icon_num) {
  let emojiSelector = document.createElement("div");
  emojiSelector.key = habit_id;
  emojiSelector.id = "emojiSelector";
  emojiSelector.className =
    "absolute top-7 right-0 grid grid-cols-5 gap-6 bg-mainYellow p-2 rounded-lg";

  Array.from({ length: 5 }, (_, i) => {
    let emoji = document.createElement("div");

    if (i === icon_num) {
      emoji.innerHTML = `
            <div class="bg-softYellow rounded-md p-1">
                <img
                src="static/emoji/${i}.svg"
                alt="이모지 선택 ${i}"
                width="28"
                onclick="handleEmojiClick(${i})"
                />
            </div>`;
    } else {
      emoji.innerHTML = `
            <div class="hover:bg-softYellow rounded-md p-1">
                <img
                src="static/emoji/${i}.svg"
                alt="이모지 선택 ${i}"
                width="28"
                onclick="handleEmojiClick(${i})"
                />
            </div>`;
    }
    emojiSelector.appendChild(emoji);
  });
  document
    .querySelector(`#complimentToggle${habit_id}`)
    .appendChild(emojiSelector);
}

const handleEmojiClick = (iconNum) => {
  const habitId = document.querySelector("#emojiSelector").key;

  $.ajax({
    type: "POST",
    url: `/compliments`,
    data: { habit_id: habitId, icon_num: iconNum },
    success: function (response) {
      if (response["result"] != "success") {
        alert("칭찬하기 실패!");
        return;
      }
      location.reload();
    },
  });
};
