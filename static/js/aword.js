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
      }
      // 3. 서버가 돌려준 stars_list를 movies 라는 변수에 저장합니다.
      let { icon_num } = response["data"];
      // 4. 영화 카드를 추가합니다. 이 때 휴지통 여부에 따라 카드 모양이 달라지므로 휴지통 여부(=false)도 같이 전달합니다.
      showEmojiSelector(habit_id, icon_num);
      $(`#complimentToggleButton${habit_id}`).text("접어두기");
    },
  });
}

function showEmojiSelector(habit_id, icon_num) {
  let emojiSelector = document.createElement("div");
  emojiSelector.id = "emojiSelector";
  emojiSelector.className =
    "absolute top-7 right-0 grid grid-cols-5 gap-6 bg-mainYellow p-2 rounded-lg";

  Array.from({ length: 5 }, (_, i) => {
    let emoji = document.createElement("div");

    if (i + 1 === icon_num) {
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
