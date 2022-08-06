/* 
 * CSE 154 Creative Project 3
 * Bible Chinese Worksheet Maker
 * Author: Wei Zhang
 * Date: 8/6/2022
 */

"use strict";

(function (){

  const URL = "https://getbible.net/v2/";
  const SVG_URL = "https://raw.githubusercontent.com/parsimonhi/animCJK/master/svgsZhHans/";
  const CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;

  const BOOKS = {
    traditional: ['創世記', '出埃及記', '利未記', '民數記', '申命記', '約書亞記', '士師記', '路得記', '撒母耳記上', '撒母耳記下', '列王紀上', '列王紀下', '歷代志上', '歷代志下', '以斯拉記', '尼希米記', '以斯帖記', '約伯記', '詩篇', '箴言', '傳道書', '雅歌', '以賽亞書', '耶利米書', '耶利米哀歌', '以西結書', '但以理書', '何西阿書', '約珥書', '阿摩司書', '俄巴底亞書', '約拿書', '彌迦書', '那鴻書', '哈巴谷書', '西番雅書', '哈該書', '撒迦利亞', '瑪拉基書', '馬太福音', '馬可福音', '路加福音', '約翰福音', '使徒行傳', '羅馬書', '歌林多前書', '歌林多後書', '加拉太書', '以弗所書', '腓立比書', '歌羅西書', '帖撒羅尼迦前書', '帖撒羅尼迦後書', '提摩太前書', '提摩太後書', '提多書', '腓利門書', '希伯來書', '雅各書', '彼得前書', '彼得後書', '約翰一書', '約翰二書', '約翰三書', '猶大書', '启示录'],
    simplified: ['创世记', '出埃及记', '利未记', '民数记', '申命记', '约书亚记', '士师记', '路得记', '撒母耳记上', '撒母耳记下', '列王纪上', '列王纪下', '历代志上', '历代志下', '以斯拉记', '尼希米记', '以斯帖记', '约伯记', '诗篇', '箴言', '传道书', '雅歌', '以赛亚书', '耶利米书', '耶利米哀歌', '以西结书', '但以理书', '何西阿书', '约珥书', '阿摩司书', '俄巴底亚书', '约拿书', '弥迦书', '那鸿书', '哈巴谷书', '西番雅书', '哈该书', '撒迦利亚', '玛拉基书', '马太福音', '马可福音', '路加福音', '约翰福音', '使徒行传', '罗马书', '歌林多前书', '歌林多后书', '加拉太书', '以弗所书', '腓立比书', '歌罗西书', '帖撒罗尼迦前书', '帖撒罗尼迦后书', '提摩太前书', '提摩太后书', '提多书', '腓利门书', '希伯来书', '雅各书', '彼得前书', '彼得后书', '约翰一书', '约翰二书', '约翰三书', '犹大书', '启示录']
  };

  // TODO: css
  // TODO: jsdoc, eslint, w3c validate

  $(window).on("load", init);

  function init() {
    $("#search-btn").on("click", getBiblePassage);
    $("#version").on("change", getBiblePassage);
    $("#write-btn").on("click", () => animate("animateCharacter"));
    $("#quiz-btn").on("click", () => animate("quiz"));
  }

  async function animate(functionName) {
    $("#container").html("");

    // get selected text
    const selected = window.getSelection().toString();
    for (const [index, char] of Array.from(selected).entries()) {
      if (!CHINESE.test(char)) { // punctuation & non-Chinese characters
        console.log(char);
        $("<div>").text(char)
          .addClass("punctuation")
          .appendTo($("#container"));
      } else { // chinese characters
        let data = await fetch(SVG_URL + char.charCodeAt(0) + ".svg")
          .then(checkStatus)
          .then(resp => resp.text());
          $("<div>").html(data)
            .addClass("char")
            .appendTo($("#container"));
      }
    }
  }

  function getBiblePassage() {
    if (!$("#search-text").val()) return;
    // TODO allow comma separated list of books chapters and verses
    let regex = /((?:[1234]\s?)?[A-Za-zа-я]+)(\s?\d+(?::(?:\d+[—–-]\d+|\d+)(?:,\d+[—–-]\d+|,\d+)*(?:;\s?\d+(?::(?:\d+[—–-]\d+|\d+)(?:,\d+[—–-]\d+|,\d+)*|;))*)?)/;
    let [_, book, chapterVerses] = $("#search-text").val().match(regex);
    let [__, chapter, verses] = chapterVerses.trim().match(/(\d+[—–-]\d+|\d+):(\d+[—–,-]\d+|\d+)/);
    console.log(book);
    console.log(chapter);
    console.log(verses);
    fetchBiblePassage(book, chapter, verses);
  }

    // get books of the bible
  function fetchBiblePassage(bookName, chapter, verses) {
    fetch(URL + $("#version").val() + "/books.json")
    .then(checkStatus)
    .then(resp => resp.json())
    .then(data => findBookNumber(data, bookName))
    .then(bookNumber => {
      getBibleChapter(bookNumber, chapter, verses);
      updateReference(bookNumber, chapter, verses);
    });
    // TODO error handling
  }

  function getBibleChapter(bookNumber, chapter, verses) {
    fetch(URL + $("#version").val() + "/" + bookNumber + "/" + chapter + ".json")
      .then(checkStatus)
      .then(resp => resp.json())
      .then((data) => updateVerse(data, verses));
    // TODO error handling
  }

  function findBookNumber(data, bookName) {
    let num = Object.keys(data)
      .map(key => data[key])
      .find(el => el.name === bookName)
      .nr;
    return num;
  }

  function updateReference(bookNumber, chapter, verses) {
    const simplified = $("#version").val().endsWith('s');
    const bookNamesChinese = BOOKS[simplified ? "simplified" : "traditional"];
    $("#bible-reference").text(bookNamesChinese[bookNumber - 1] + " " + chapter + ":" + verses);
  }

  function updateVerse(data, verses) {
    let text = "";
    verses.split(",").forEach(v => {
      let [verseBegin, verseEnd] = v.trim().split("-");
      text += getVerses(data, verseBegin, verseEnd);
    })
    $("#bible-text").text(text);
  }

  function getVerses(data, verseBegin, verseEnd) {
    verseEnd = verseEnd || verseBegin;
    let text = "";
    for (let v = verseBegin; v <= verseEnd; v++) {
      // TODO: add verse number to text
      text += data.verses.at(v-1).text;
    }
    return text;
  }

  function checkStatus(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }

})();