export const tile=(x,y,kind,tier='basic')=>({x,y,kind,tier});
const h=(x,y,n)=>Array.from({length:n},(_,i)=>tile(x+i,y,'h'));
const v=(x,y,n)=>Array.from({length:n},(_,i)=>tile(x,y+i,'v'));
export const fixtures=[
 {name:'Ten horizontal repeats',id:'repeat-h',w:10,h:1,tiles:h(0,0,10)},
 {name:'Ten vertical repeats',id:'repeat-v',w:1,h:10,tiles:v(0,0,10)},
 {name:'Closed loop · all four turns',id:'loop',w:7,h:4,tiles:[tile(0,0,'bend-es'),...h(1,0,5),tile(6,0,'bend-ws'),...v(6,1,2),tile(6,3,'bend-nw'),...h(1,3,5),tile(0,3,'bend-ne'),...v(0,1,2)]},
 {name:'S route · mixed-tier bends',id:'s-route',w:7,h:4,tiles:[...h(0,0,2),tile(2,0,'bend-ws','precision'),tile(2,1,'v'),tile(2,2,'bend-ne','precision'),...h(3,2,2),tile(5,2,'bend-ws'),tile(5,3,'bend-ne'),tile(6,3,'h')]},
 {name:'U route · basic / precision',id:'u-route',w:6,h:3,tiles:[...v(0,0,2),tile(0,2,'bend-ne'),...h(1,2,4),tile(5,2,'bend-nw','precision'),...v(5,0,2)]},
 {name:'Four-port junction · explicit split / combine',id:'junction',w:7,h:3,tiles:[...h(0,1,3),tile(3,1,'junction','precision'),...h(4,1,3),tile(3,0,'v'),tile(3,2,'v')]},
 {name:'Horizontal overpass · independent paths',id:'cross-h',w:7,h:3,tiles:[...h(0,1,3),tile(3,1,'cross-h'),...h(4,1,3),tile(3,0,'v'),tile(3,2,'v')]},
 {name:'Vertical overpass · independent paths',id:'cross-v',w:7,h:3,tiles:[...h(0,1,3),tile(3,1,'cross-v'),...h(4,1,3),tile(3,0,'v'),tile(3,2,'v')]},
 {name:'Deleted section · genuine gap and open ends',id:'gap',w:7,h:1,tiles:[...h(0,0,3),...h(4,0,3)]},
];
