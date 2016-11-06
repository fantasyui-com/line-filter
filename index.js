#!/usr/bin/env node
process.stdin.setEncoding('utf8');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const setup = require('commander');
function collect(a, b) { a.split(/, */).map(a=>b.push(path.resolve(a))); return b; }
function collectSet(a, b) { a.split(/, */).map( a=>b.add(a) ); return b; }
setup.version('1.0.0')
  .option('-v, --verbose', 'Make changeline verbose')
  .option('--any-case', 'Allow any case (do not force lowercase)')
  .option('-l, --label', 'Prefix entries with a/d/n (allow, deny, noop) labels')
  .option('-t, --trace', 'Print rule location(s)')
  .option('-a, --allow <path>', 'Specify allow file.', collect, [])
  .option('-d, --deny <path>' , 'Specify deny file.', collect, [])
  .option('-p, --print [things]' , 'Specify what to print [a|d|n] (allow, deny, none) ', collectSet, new Set())
  .parse(process.argv);
const filter = {};
filter.lookup = new Map();
lookup = function(line, filepath){
  if(filter.lookup.has(line)){
    filter.lookup.get(line).push(filepath);
  }else{
    filter.lookup.set(line,[filepath])
  }
}
filter.allow = new Set();
filter.deny = new Set();
if(setup.print.size == 0){
  setup.print.add('a');
  setup.print.add('n');
}
let shapeLine = function(string){
  let output = string.trim();

  if(output) {
    if(setup.anyCase) {
      // don't lowercase
    }else{
      output = output.toLowerCase();
    }
  }
  return output;
}
setup.allow.forEach(filepath => {
  fs.readFileSync(filepath, { encoding: 'utf8' }).split("\n").forEach(line=>{
    let shaped = shapeLine(line);
    if(shaped){
      filter.allow.add(shaped);
      lookup(shaped, filepath);
    }
  })
});
setup.deny.forEach(filepath => {
  fs.readFileSync(filepath, { encoding: 'utf8' }).split("\n").forEach(line=>{
    let shaped = shapeLine(line);
    if(shaped){
      filter.deny.add(shaped);
      lookup(shaped, filepath);
    }
  })
});
const stdin = readline.createInterface({ input: process.stdin });
stdin.on('line',(line)=>{
  let shaped = shapeLine(line);
  if(shaped){
    if( filter.deny.has(shaped) ){
      if(setup.print.has('d')) {
        let output = "";
        if(setup.label){
          output+='d: ';
        }
        output+=shaped;
        if(setup.trace){
          output += ' (';
          output += filter.lookup.get(shaped).join()
          output += ')';
        }
        console.log(output);
      }
    } else {
      if( filter.allow.has(shaped) ){
        if(setup.print.has('a')) {
          let output = "";
          if(setup.label){
            output+='a: ';
          }
          output+=shaped;
          if(setup.trace){
            output += ' (';
            output += filter.lookup.get(shaped).join()
            output += ')';
          }
          console.log(output);
        }
      } else {
        if(setup.print.has('n')) {
          let output = "";
          if(setup.label){
            output+='n: ';
          }
          output+=shaped;
          if(setup.trace){
            output += ' (noop)';
          }
          console.log(output);
        }
      }
    }
  }
});
