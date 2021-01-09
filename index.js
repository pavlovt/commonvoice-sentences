const readline = require('readline');
const fs = require('fs');
const _ = require('lodash');

toCsv();

function toCsv(file) {
  const read = readline.createInterface({
    input: fs.createReadStream('./txt/aleko.txt'),
    // output: process.stdout,
    console: false
  });

  var file = fs.createWriteStream('./csv/tst.csv', {
    flags: 'a' // 'a' means appending (old data will be preserved)
  });

  const hasEndLine = /[\.\?!]/;
  let sent = '', sents = [], remain = '', prevRemain = '';
  read.on('line', function (line) {
    line = line.trim();
    if (line.length < 30 && !hasEndLine.test(line)) return;

    remain = getSentences(line, sents);
    // console.log('new line ', line.length, line, sents, remain);
    // the sentence continues, no new sentences
    if (_.isEmpty(sents) && !_.isEmpty(prevRemain)) sent += ' ' + prevRemain;
    else {
      while (!_.isEmpty(sents)) {
        if (!_.isEmpty(prevRemain)) sent += ' ' + prevRemain;
        sent += ' ' + sents.shift();
        sent = sent.replace('\n', '').trim();
        // console.log('sent', sent);
        // check if the sentence is long enough but has < 24 words
        if (sent.length > 30 && sent.split(' ').length < 15) file.write(sent + '\n');
        sent = '';
        prevRemain = '';
      }
    }
    sents = [];
    prevRemain = remain;
  });

  read.on('close', _ => {
    // file.end();
  });
}

function getSentences(line, sentences = []) {
  let res = line.match(/[^\.\?!]+[\.\?!]/);
  const hasEndLine = /[\.\?!]/;
  if (res && (_.includes(line, '.)') || _.includes(line, '!)') || _.includes(line, '...') || _.includes(line, '? —') || _.includes(line, '! –') || _.includes(line, '. —'))) {
    // if it has ... or (fads fasd.) but ends with .? or ! make it one sentence
    // else the sentence continues on the next line
    if (hasEndLine.test(line[line.length - 1])) res = [line]
    else res = null;
  }

  if (res) {
    sentences.push(res[0].trim());
    line = line.replace(res[0], '');
    return getSentences(line, sentences);
  }

  return line;
}

