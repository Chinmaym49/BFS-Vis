let n=25;
let ids=[];                                            // Stores all cell ids
for(let i=0;i<n;i++) {
    ids.push([]);
    for(let j=0;j<n;j++) {
        ids[i].push(`cell_${i}_${j}`);
    }
}

let mousedown=false;
let flags={src:0,dst:0,obs:0,_obs:0};
let pts={src:[-1,-1],dst:[-1,-1],obs:[]};
let clrs={src:"rgb(25, 220, 84)",dst:"rgb(240, 53, 69)",obs:"rgb(108, 117, 125)",path:"rgb(13, 110, 253)",vis:"rgb(255, 193, 7)",emp:"rgb(255, 255, 255)"};

let handleEvent=(cell)=> {

    cell.addEventListener("click",()=> {
        let [c,i,j]=cell.getAttribute("id").split("_");
        i=parseInt(i);
        j=parseInt(j);
        
        if(flags.src && !isDst(i,j) && !found(i,j)) {
            pts.src[0]=i;
            pts.src[1]=j;
            clearGrid();
            cell.style.backgroundColor=clrs.src;
        } else if(flags.dst && !isSrc(i,j) && !found(i,j)) {
            pts.dst[0]=i;
            pts.dst[1]=j;
            clearGrid();
            cell.style.backgroundColor=clrs.dst;
        }
    });

    cell.addEventListener("mousedown",()=>{
        mousedown=true;
    });

    cell.addEventListener("mouseup",()=>{
        mousedown=false;
    });

    cell.addEventListener("mousemove",()=>{
        let [c,i,j]=cell.getAttribute("id").split("_");
        i=parseInt(i);
        j=parseInt(j);
        
        if(mousedown && flags.obs && !isSrc(i,j) && !isDst(i,j)) {
            if(!found(i,j)) {
                pts.obs.push([i,j]);
            }
            cell.style.backgroundColor=clrs.obs;
        } else if(mousedown && flags._obs && !isSrc(i,j) && !isDst(i,j)) {
            let k=found(i,j);
            if(k) {
                pts.obs.splice(k-1,1);
            }
            cell.style.backgroundColor=clrs.emp;
        }
    });
};

let createGrid=()=> {
    let grid=document.querySelector("#gridd");
    grid.innerHTML="";
    for(let i=0;i<n;i++) {
        let row=document.createElement("div");         // Row element
        row.classList.add("roww");
        for(let j=0;j<n;j++) {
            let cell=document.createElement("div");     // Cell element
            cell.classList.add("cell");
            cell.setAttribute("id",ids[i][j]);
            handleEvent(cell);
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
};

let clearFlags=()=> {
    for(let k in flags) {
        flags[k]=0;
    }
};

let clearGrid=()=> {                        // Clears everything but src, dst and obs
    for(let i=0;i<n;i++) {
        for(let j=0;j<n;j++) {
            if(!found(i,j) && !isSrc(i,j) && !isDst(i,j)) {
                document.getElementById(ids[i][j]).style.backgroundColor=clrs.emp;
            }
        }
    }
};

let isSrc=(i,j)=> (pts.src[0]==i && pts.src[1]==j);

let isDst=(i,j)=> (pts.dst[0]==i && pts.dst[1]==j);

let found=(i,j)=> {
    for(var k=0;k<pts.obs.length;k++) {
        if(pts.obs[k][0]==i && pts.obs[k][1]==j) {
            return k+1;
        }
    }
    return false;
};

let isCool=(i,j)=> (i>=0 && i<n && j>=0 && j<n && document.getElementById(`cell_${i}_${j}`).style.backgroundColor!=clrs.obs);

let sleep=(time)=> {
    return new Promise((res)=> {
        setTimeout(()=> {
            res("sleeping for some time");
        },time);
    });
}

let disEnBut=(stat)=> {
    document.getElementById("src").disabled=stat;
    document.getElementById("dst").disabled=stat;
    document.getElementById("start").disabled=stat;
    document.getElementById("obs").disabled=stat;
    document.getElementById("_obs").disabled=stat;
    document.getElementById("clear").disabled=stat;
};

let bfs=async(gph,vis,par,src,dst)=> {
    disEnBut(true);
    let f=0;
    let q=[src];
    vis[src]=1;
    while(q.length) {
        let x=q.shift();
        for(let i of gph[x]) {
            await sleep(1);
            if(i==dst) {
                par[dst]=x;
                f=1;
                break;
            }
            if(!vis[i]) {
                document.getElementById(i).style.backgroundColor=clrs.vis;
                vis[i]=1;
                par[i]=x;
                q.push(i);
            }
        }
        if(f) {
            break;
        }
    }
    if(!f) {
        alert("No path exists!");
    } else {
        let path=[];
        let x=dst;
        while(x!=src) {
            path.push(x);
            x=par[x];
        }
        for(let i=1;i<path.length;i++) {
            await sleep(5);
            document.getElementById(path[i]).style.backgroundColor=clrs.path;
        }
    }
    disEnBut(false);
};

window.addEventListener("load",createGrid);

document.querySelector("#src").addEventListener("click",()=> {
    clearFlags();
    flags.src=1;
});

document.querySelector("#dst").addEventListener("click",()=> {
    clearFlags();
    flags.dst=1;
});

document.querySelector("#obs").addEventListener("click",()=> {
    clearFlags();
    flags.obs=1;
});

document.querySelector("#_obs").addEventListener("click",()=> {
    clearFlags();
    flags._obs=1;
});

document.querySelector("#clear").addEventListener("click",()=> {
    clearFlags();
    pts={src:[-1,-1],dst:[-1,-1],obs:[]};
    createGrid();
});

document.querySelector("#start").addEventListener("click",()=> {
    clearFlags();
    if(pts.src[0]==-1 || pts.src[1]==-1) {
        alert("Choose src!");
    } else if(pts.dst[0]==-1 || pts.dst[1]==-1) {
        alert("Choose dst!");
    } else {
        let gph=new Map();
        let vis=new Map();
        let par=new Map();
        for(let i=0;i<n;i++) {
            for(let j=0;j<n;j++) {
                let id=ids[i][j];
                if(document.getElementById(id).style.backgroundColor!="rgb(0, 0, 0)") {
                    gph[id]=[];
                    vis[id]=0;
                    par[id]=-1;
                    if(isCool(i,j+1)) {
                        gph[id].push(ids[i][j+1]);
                    }
                    if(isCool(i+1,j)) {
                        gph[id].push(ids[i+1][j]);
                    }
                    if(isCool(i,j-1)) {
                        gph[id].push(ids[i][j-1]);
                    }
                    if(isCool(i-1,j)) {
                        gph[id].push(ids[i-1][j]);
                    }
                }
            }
        }
        bfs(gph,vis,par,`cell_${pts.src[0]}_${pts.src[1]}`,`cell_${pts.dst[0]}_${pts.dst[1]}`);
    }
});

