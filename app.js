'use strict'
// ファイルを扱うためのモジュール
const fs = require('fs')
// ファイルを1行ずつ読むためのモジュール
const readline = require('readline')

// csvファイルを読み込みStreamを生成
// Streamとは情報自体ではなく情報の流れ
const rs = fs.createReadStream('./popu-pref.csv')
const rl = readline.createInterface({ input: rs, output: {} })

// 集計されたデータを格納する連想配列
// key: 都道府県 value: 集計データのオブジェクト
const prefectureDataMap = new Map()

// lineイベントが発生したら無名関数を実行（1行ずつ発火）
rl.on('line', lineString => {
  // lineStringには読み込んだ 1 行の文字列が入っている
  // ","で区切って配列に格納
  const columns = lineString.split(',')
  // 年
  const year = parseInt(columns[0])
  // 都道府県
  const prefecture = columns[1]
  // 人口
  const popu = parseInt(columns[3])
  if (year === 2010 || year === 2015) {
    // 都道府県の
    let value = prefectureDataMap.get(prefecture)
    if (!value) {
      //データを処理するのが初めて
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      }
    }
    if (year === 2010) {
      value.popu10 = popu
    }
    if (year === 2015) {
      value.popu15 = popu
    }
    prefectureDataMap.set(prefecture, value)
  }
})

// 全ての行を読み込み終わった際に無名関数を実行
rl.on('close', () => {
  // 各都道府県の人口変化率を計算
  for (let [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10
  }
  // 変化率の降順に並び替え（連想配列を配列に変換）
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    // 前の引数（pair1）を後の引数（pair2）より前にしたい時 → 負の数
    // 前の引数（pair1）を後の引数（pair2）より後ろにしたい時 → 正の数
    return pair2[1].change - pair1[1].change
  })

  // 整形
  const rankingStrings = rankingArray.map(([key, value]) => {
    return (
      key +
      ': ' +
      value.popu10 +
      '=>' +
      value.popu15 +
      ' 変化率:' +
      value.change
    )
  })
  console.log(rankingStrings)
})
