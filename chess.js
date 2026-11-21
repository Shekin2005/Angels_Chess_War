/*
 * ANGEL'S CHESS WAR
 * Student: Shekin David Raj
 * File: chess.js
 * Purpose: Chess game rules, move validation, turns, captures, promotion, and gameplay controls.
 * Existing functionality is preserved; imported assets belong to their credited creators.
 */

// READABILITY NOTES: Comments explain the existing code; the game logic is unchanged.
'use strict';
/* Legal chess engine: castling, en passant, promotion, check, mate, stalemate, undo. */
// ChessGame: Stores a value used by the game.
const ChessGame=(()=>{
// start: Stores a value used by the game.
const start='rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR';
// glyph: Stores a value used by the game.
const glyph={K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟','.' :''};
// dirs: Stores a value used by the game.
const dirs={n:[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],b:[[-1,-1],[-1,1],[1,-1],[1,1]],r:[[-1,0],[1,0],[0,-1],[0,1]],k:[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]};
// inside: Stores a value used by the game.
const inside=(r,f)=>r>=0&&r<8&&f>=0&&f<8, side=p=>p==='.'?0:p===p.toUpperCase()?1:-1;
// initial: Stores a value used by the game.
const initial=()=>({b:start.split(''),ids:Array.from({length:64},(_,i)=>start[i]==='.'?null:i),t:1,castle:15,ep:-1,half:0,full:1});
// history: Stores a value used by the game.
let history=[initial()], selected=-1, choices=[], movesText=[], pending=null, finished=false;
// state: Stores a value used by the game.
const state=()=>history.at(-1);
// attacked(): Runs this named part of the game when called.
function attacked(s,square,by){const r=Math.floor(square/8),f=square%8;for(let i=0;i<64;i++){if(side(s.b[i])!==by)continue;let p=s.b[i].toLowerCase(),y=Math.floor(i/8),x=i%8;if(p==='p'){if(y-by===r&&Math.abs(x-f)===1)return true;continue;}let ds=p==='q'?[...dirs.b,...dirs.r]:dirs[p];for(const [dr,df] of ds){let a=y+dr,b=x+df;while(inside(a,b)){if(a===r&&b===f)return true;if(s.b[a*8+b]!=='.'||p==='n'||p==='k')break;a+=dr;b+=df;}}}return false;}
// Returns the result to the code that called this function.
function check(s,color=s.t){let king=s.b.indexOf(color===1?'K':'k');return king<0||attacked(s,king,-color);}
// apply(): Runs this named part of the game when called.
function apply(s,m){let b=s.b.slice(),ids=s.ids.slice(),p=b[m.f],taken=b[m.to],c=s.castle;b[m.f]='.';b[m.to]=m.prom?(s.t===1?m.prom.toUpperCase():m.prom):p;ids[m.to]=ids[m.f];ids[m.f]=null;if(m.ep){let i=m.to+8*s.t;b[i]='.';ids[i]=null;}if(m.castle){let rf=m.to>m.f?m.f+3:m.f-4,rt=m.to>m.f?m.f+1:m.f-1;b[rt]=b[rf];b[rf]='.';ids[rt]=ids[rf];ids[rf]=null;}if(p==='K')c&=~3;if(p==='k')c&=~12;const rook={63:1,56:2,7:4,0:8};if(p.toLowerCase()==='r')c&=~(rook[m.f]||0);if(taken.toLowerCase()==='r')c&=~(rook[m.to]||0);return {b,ids,t:-s.t,castle:c,ep:p.toLowerCase()==='p'&&Math.abs(m.to-m.f)===16?(m.to+m.f)/2:-1,half:p.toLowerCase()==='p'||taken!=='.'||m.ep?0:s.half+1,full:s.full+(s.t===-1?1:0)};}
// pseudo(): Runs this named part of the game when called.
function pseudo(s){let out=[];for(let i=0;i<64;i++){let p=s.b[i];if(side(p)!==s.t)continue;let r=i>>3,f=i%8,k=p.toLowerCase();const add=(to,flags={})=>{if(s.b[to].toLowerCase()==='k')return;if(k==='p'&&(to<8||to>=56))for(let prom of ['q','r','b','n'])out.push({f:i,to,prom,...flags});else out.push({f:i,to,...flags});};if(k==='p'){let a=r-s.t;if(inside(a,f)&&s.b[a*8+f]==='.'){add(a*8+f);let b=r-2*s.t;if(r===(s.t===1?6:1)&&s.b[b*8+f]==='.')add(b*8+f);}for(let d of [-1,1])if(inside(a,f+d)){let j=a*8+f+d;if(side(s.b[j])===-s.t)add(j);else if(j===s.ep&&s.b[j]==='.'&&s.b[j+8*s.t]===(s.t===1?'p':'P'))add(j,{ep:true});}continue;}let ds=k==='q'?[...dirs.b,...dirs.r]:dirs[k];for(let [dr,df] of ds){let a=r+dr,b=f+df;while(inside(a,b)){let j=a*8+b;if(side(s.b[j])===s.t)break;add(j);if(s.b[j]!=='.'||k==='n'||k==='k')break;a+=dr;b+=df;}}if(k==='k'&&i===(s.t===1?60:4)&&!check(s)){let bits=s.t===1?[1,2]:[4,8],rook=s.t===1?'R':'r';if((s.castle&bits[0])&&s.b[i+3]===rook&&s.b[i+1]==='.'&&s.b[i+2]==='.'&&!attacked(s,i+1,-s.t)&&!attacked(s,i+2,-s.t))add(i+2,{castle:true});if((s.castle&bits[1])&&s.b[i-4]===rook&&s.b[i-1]==='.'&&s.b[i-2]==='.'&&s.b[i-3]==='.'&&!attacked(s,i-1,-s.t)&&!attacked(s,i-2,-s.t))add(i-2,{castle:true});}}return out;}
// legal: Stores a value used by the game.
const legal=s=>pseudo(s).filter(m=>!check(apply(s,m),s.t));
// turn: Checks or updates the rules of a chess move.
const turn=document.getElementById('turnInfo'),log=document.getElementById('moveHistory'),promotion=document.getElementById('promotion');
// actorPositions: Stores a value used by the game.
let actorPositions={};function sync(){actorPositions={};state().ids.forEach((id,i)=>{if(id!==null)actorPositions[id]={row:i>>3,file:i%8,type:state().b[i].toLowerCase(),team:state().b[i]===state().b[i].toUpperCase()?'white':'black'};});}
// status(): Runs this named part of the game when called.
function status(){let s=state(),possible=legal(s);if(!possible.length)return check(s)?(s.t===1?'black':'white'):'draw';let nonKings=s.b.filter(p=>p!=='.'&&p.toLowerCase()!=='k');if(nonKings.length===0||nonKings.length===1&&['n','b'].includes(nonKings[0].toLowerCase()))return 'draw';if(s.half>=150)return 'draw';return null;}
// render(): Prepares or draws geometry on the screen.
function render(){let s=state();let end=status();turn.textContent=end?(end==='draw'?'Draw':end.toUpperCase()+' WINS'):(s.t===1?'White':'Black')+' to move'+(check(s)?' · CHECK':'');log.textContent=movesText.map((x,i)=>(i%2===0?(Math.floor(i/2)+1)+'. ':'')+x).join('  ');promotion.hidden=!pending;promotion.setAttribute('aria-hidden',String(!pending));}
// selectSquare(): Runs this named part of the game when called.
function selectSquare(i){click(i);}
// Returns the result to the code that called this function.
function highlights(){return {selected,targets:choices.map(m=>m.to)};}
// doMove(): Runs this named part of the game when called.
function doMove(m){let s=state(),captured=s.b[m.to]!=='.'||m.ep,sideName=s.t===1?'white':'black';let p=s.b[m.f];let label=(p.toLowerCase()==='p'?'':p.toUpperCase())+'abcdefgh'[m.f%8]+(8-(m.f>>3))+(captured?'×':'–')+'abcdefgh'[m.to%8]+(8-(m.to>>3))+(m.prom?'='+m.prom.toUpperCase():'');history.push(apply(s,m));movesText.push(label);selected=-1;choices=[];pending=null;sync();render();api.onMove?.();if(captured)api.onCapture?.(sideName,{row:(m.ep?m.to+8*s.t:m.to)>>3,file:(m.ep?m.to+8*s.t:m.to)%8},s.b[m.ep?m.to+8*s.t:m.to],history.length-1);let end=status();if(end){finished=true;setTimeout(()=>api.onEnd?.(end),captured?3100:400);} }
// click(): Responds to player input.
function click(i){if(finished||pending)return;let s=state();if(side(s.b[i])===s.t){selected=i;choices=legal(s).filter(m=>m.f===i);render();return;}let found=choices.filter(m=>m.to===i);if(found.length>1){
 pending=found;
 promotion.replaceChildren();
 // heading: Stores a value used by the game.
 const heading=document.createElement('div');heading.className='promotion-heading';
 heading.textContent='PAWN PROMOTION — Choose your new character';promotion.appendChild(heading);
 // options: Stores a value used by the game.
 const options=document.createElement('div');options.className='promotion-options';
 // names: Stores a value used by the game.
 const names={q:'Queen',r:'Rook',b:'Bishop',n:'Knight'};
 // symbols: Stores a value used by the game.
 const symbols={white:{q:'♕',r:'♖',b:'♗',n:'♘'},black:{q:'♛',r:'♜',b:'♝',n:'♞'}};
 // team: Stores a value used by the game.
 const team=s.t===1?'white':'black';
 // Repeats this block for the required items or frames.
 for(const type of ['q','r','b','n']){
  // m: Stores a value used by the game.
  const m=found.find(x=>x.prom===type);if(!m)continue;
  // b: Stores a value used by the game.
  const b=document.createElement('button');b.type='button';b.className='promotion-choice';
  b.innerHTML='<span class="promotion-symbol" aria-hidden="true">'+symbols[team][type]+'</span><span>'+names[type]+'</span>';
  b.setAttribute('aria-label','Promote pawn to '+names[type]);
  b.onclick=()=>doMove(m);options.appendChild(b);
 }
 promotion.appendChild(options);
 // cancel: Stores a value used by the game.
 const cancel=document.createElement('button');cancel.type='button';cancel.className='promotion-cancel';cancel.textContent='Cancel';
 cancel.onclick=()=>{pending=null;selected=-1;choices=[];render();};promotion.appendChild(cancel);
 render();promotion.querySelector('.promotion-choice')?.focus();return;
 }if(found.length===1)doMove(found[0]);else{selected=-1;choices=[];render();}}
// restart(): Restores an earlier game or camera state.
function restart(){api.onRestart?.();history=[initial()];movesText=[];selected=-1;choices=[];pending=null;finished=false;sync();render();}
// Returns the result to the code that called this function.
function undo(){if(history.length<2)return;api.onUndo?.(history.length-1);history.pop();movesText.pop();selected=-1;choices=[];pending=null;finished=false;sync();render();}
document.getElementById('undoMove').onclick=undo;document.getElementById('newGame').onclick=()=>{restart();if(typeof setPhase==='function')setPhase('intro');};
// api: Stores a value used by the game.
const api={get actorPositions(){return actorPositions;},onCapture:null,onEnd:null,onMove:null,onRestart:null,onUndo:null,restart,undo,selectSquare,highlights,get finished(){return finished;}};sync();render();return api;
})();
