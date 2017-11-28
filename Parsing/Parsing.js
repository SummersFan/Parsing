//语法分析器


//文法定义
// let G = ['S->AB', 'S->bCA', 'A->b', 'A->ε', 'B->ε', 'B->aD', 'C->ADE', 'C->b', 'D->aS', 'D->c', 'D->ε', 'E->e'];

let G = ['E->E+T|T', 'T->T*F|F', 'F->(E)|i'];
// let G= ['S->ABBA','A->a|ε','B->b|ε'];
let Vn = [];    //非终结符集合
let Vt = [];    //终结符结合
let GL = [];    //文法左部
let RL = [];    //文法右部
let first = {};  //first集
let follow = {};    //follow集
let inputString = 'i*i+i#';

//消除左递归
G.map(function (value, index) {
    let valueLeft = value.split('->')[0];
    let valueRight = value.split('->')[1];
    let valueArr = valueRight.split('|');
    let value1 = valueRight.split('|')[0];
    let value2 = valueRight.split('|')[1];
    // console.log(valueLeft);

    if (valueLeft === valueRight[0] && value2[0] !== valueLeft) {


        let str = valueLeft + '->' + value2 + valueLeft + '\'';
        G.splice(index, 1, str);
        let str1 = valueLeft + '\'' + '->';
        for (let i = 1; i < value1.length; i++) {
            str1 += value1[i];
        }
        str1 += valueLeft + '\'' + '|' + 'ε';
        G.splice(index, 0, str1);
    }
});

// //消除
// G.map(function (value,index) {
//     let value1ArrLeft = value1.split(['->'])[0];
//     let value1ArrRight = value1.split('->')[1];
//     let valueAllSplit = value1ArrRight.split('|');  //分割'|'
// });

//提取左边公共因子
G.map(function (value) {
});

//获得非终结符集合
G.map(function (value) {
    // console.log(value);
    // getVn(new Array(value));
    let n;
    n = value.split('->')[0];
    if (Vn.indexOf(n) === -1) {
        Vn.push(n);
    }
});


//获得终结符集合
G.map(function (value) {
    let valueTrue = value.split('->')[1];
    for (let index in valueTrue) {
        if (valueTrue[index] !== '|' && valueTrue[index] !== '\'' && Vn.indexOf(valueTrue[index]) === -1 && Vt.indexOf(valueTrue[index]) === -1) {
            Vt.push(valueTrue[index]);
        }
    }
});

//重定义first集和follow集
Vn.map(function (value) {
    first[value] = [];
    follow[value] = [];
});

//求first集函数
let getFirst = function (value, callback) {

    G.map(function (value1) {   //一行一行分析
        let value1ArrLeft = value1.split(['->'])[0];
        let value1ArrRight = value1.split('->')[1];
        let valueAllSplit = value1ArrRight.split('|');  //分割'|'


        for (let i in valueAllSplit) {

            let arr = valueAllSplit[i]; //所有的箭头右部

            if (value1ArrLeft === value && Vt.indexOf(arr[0]) !== -1) {  //若X∈VT，则FIRST(X)＝{X}

                if (first[value].indexOf(arr[0]) === -1) {
                    if (arr[0] !== 'ε') {
                        first[value].push(arr[0]);
                        if (callback) {
                            callback(1, arr[0]);
                        }
                    }else{  //可以推出空串

                        first[value].push('ε');
                        if (callback) {
                            callback(2, 'ε');
                        }
                    }
                }
            } else if (value1ArrLeft === value && Vn.indexOf(arr[0]) !== -1) {  //若是非终结符X，能推导出以终结符a开头的串，那么这个终结符a属于FIRST（X），若X能够推导出空符号串ε，那么空符号串ε也属于X的FIRST集
                getFirst(arr[0]);
                for (let j in arr) {

                    getFirst(arr[j]);

                    if (Vt.indexOf(arr[j]) !== -1) {   //跳出处理
                        break;
                    }

                    if (Vn.indexOf(arr[j]) !== -1 && j === '0') {       //第一个符号处理

                        for (let k in first[arr[0]]) {  //第一个非终结符号的first集合加入
                            if (first[value].indexOf(first[arr[0]][k]) === -1 && first[arr[0]][k] !== 'ε') {
                                first[value].push(first[arr[0]][k]);
                                if (callback) {
                                    callback(1, first[arr[0]][k]);
                                }
                            }
                        }

                        if (first[arr[j]].indexOf('ε') === -1) {  //  没有空串则做跳出处理
                            break;
                        }
                    }

                    if (Vn.indexOf(arr[j]) !== -1 && j > 0 && first[arr[j - 1]].indexOf('ε') !== -1) {//后边符号处理

                        for (let k in first[arr[j]]) {
                            if (first[value].indexOf(first[arr[j]][k]) === -1 && first[arr[j]][k] !== 'ε') {
                                first[value].push(first[arr[j]][k]);
                                if (callback) {
                                    callback(1, first[arr[j]][k]);
                                }
                            }
                        }

                        if (first[arr[j]].indexOf('ε') === -1) {  //  没有空串则做跳出处理

                            break;
                        }
                    }

                    if (Vn.indexOf(arr[j]) !== -1 && j === arr.length.toString() && first[arr[j - 1]].indexOf('ε') !== -1 && first[arr[j]].indexOf('ε') !== -1) {    //最后一个符号'ε'再处理
                        if (first[value].indexOf('k') === -1) {
                            first[value].push('k');
                            if (callback) {
                                callback(1, 'k');
                            }
                        }
                    }
                }
            }
        }
    })
};

//求follow集函数
let getFollow = function (value) {
    if (follow[value].indexOf('#') === -1) {
        follow[value].push('#');    //先加入#
    }


    G.map(function (value1) {   //一行一行分析
        let value1ArrLeft = value1.split(['->'])[0];
        let value1ArrRight = value1.split('->')[1];
        let valueAllSplit = value1ArrRight.split('|');  //分割'|'


        if (value1.indexOf(value)) {      //对需要的一行进行分析
            for (let i in valueAllSplit) {
                let arr = valueAllSplit[i];//有的箭头右部

                let brr = [];
                for (let j in arr) {
                    if (arr[j] === '\'') {
                        let str = arr[j - 1] + '\'';

                        brr.pop();
                        brr.push({str});
                        j += 1;
                    } else {
                        brr.push(arr[j]);
                    }
                }

                for (let j in brr) {
                    j = parseInt(j); //改变类型

                    let char, char1, char2;
                    if (typeof brr[j] === "object") {
                        char = brr[j].str;
                    } else {
                        char = brr[j];
                    }

                    if (typeof brr[j + 1] === "object") {
                        char1 = brr[j + 1].str;
                    } else {
                        char1 = brr[j + 1];
                    }

                    if (typeof brr[j - 1] === "object") {
                        char2 = brr[j - 1].str;
                    } else {
                        char2 = brr[j - 1];
                    }

                    if (char === value && Vn.indexOf(char) !== -1 && Vt.indexOf(char1) !== -1) {

                        if (follow[value].indexOf(char1) === -1) {
                            follow[value].push(char1);
                        }
                    }


                    if (char === value && j > 0 && j < brr.length && Vn.indexOf(char) !== -1 && Vn.indexOf(char1) !== -1) {   //对于产生式：A->aBC,将除去空集e的First（C）加入Follow（B）中;


                        for (let k in first[char1]) {  //第一个非终结符号的first集合加入
                            if (follow[char].indexOf(first[char1][k]) === -1 && first[char1][k] !== 'ε') {

                                if (follow[value].indexOf(first[char1][k]) === -1) {
                                    follow[value].push(first[char1][k]);
                                }

                            }
                        }

                        if (first[char1].indexOf('ε') !== -1) {

                            getFollow(value1ArrLeft);

                            for (let k in follow[value1ArrLeft]) {
                                if (follow[value].indexOf(follow[value1ArrLeft][k]) === -1) {
                                    follow[value].push(follow[value1ArrLeft][k]);
                                }
                            }
                            return;
                        }
                    } else if (char === value && Vn.indexOf(char) !== -1 && j === brr.length - 1) {

                        if (first[char].indexOf('ε') !== -1) {


                            getFollow(value1ArrLeft);     //对需要的那一行进行分析防止递归的堆栈溢出错误

                            for (let k in follow[value1ArrLeft]) {
                                if (follow[value].indexOf(follow[value1ArrLeft][k]) === -1) {
                                    follow[value].push(follow[value1ArrLeft][k]);
                                }
                            }
                        }
                        return;

                    }
                }
            }

        }
    });

};

//判断LL(1)文法函数
let chargeLL1 = function () {
    let flag = 0;    //LL(1)文法判断标志
    //条件1不含左递归
    //条件2文法中每一个产生式的候选集两两不相交
    //条件3first(A)与follow(A)不想交
    G.map(function (value1) {
        let value1ArrLeft = value1.split(['->'])[0];
        let value1ArrRight = value1.split('->')[1];
        let valueAllSplit = value1ArrRight.split('|');  //分割'|'

        for (let i in valueAllSplit) {
            let arr = valueAllSplit[i];//有的箭头右部


            let brr = [];
            for (let j in arr) {
                if (arr[j] === '\'') {
                    let str = arr[j - 1] + '\'';

                    brr.pop();
                    brr.push({str});
                    j += 1;
                } else {
                    brr.push(arr[j]);
                }
            }

            for (let j in brr) {
                j = parseInt(j); //改变类型

                let char, char1, char2;
                if (typeof brr[j] === "object") {
                    char = brr[j].str;
                } else {
                    char = brr[j];
                }

                if (typeof brr[j + 1] === "object") {
                    char1 = brr[j + 1].str;
                } else {
                    char1 = brr[j + 1];
                }

                if (typeof brr[j - 1] === "object") {
                    char2 = brr[j - 1].str;
                } else {
                    char2 = brr[j - 1];
                }


                for (let k = j + 1; k < brr.length; k++) {  //条件2
                    if (typeof brr[k] === "object") {
                        char1 = brr[k].str;
                    } else {
                        char1 = brr[k];
                    }

                    for (let l in first[char]) {
                        if (first[char1] === undefined || first[char1] === undefined) {
                            continue;
                        }
                        if (first[char1].indexOf(first[char][l]) !== -1) {
                            flag = -1;
                            return -1;
                        }
                    }
                }
            }


        }

        for (let i in first[value1ArrLeft]) {

            if (follow[value1ArrLeft].indexOf(first[value1ArrLeft][i]) !== -1) {

                flag = -1;
                return -1;
            }
        }
    });
    return flag;
};


//修改的数组
let Vt1 = new Array();
for(let i in Vt){
    if(Vt[i] !== 'ε'){
        Vt1.push(Vt[i]);
    }
}
Vt1.push('#');


//预测分析表构造函数
let getPredictAnalyticalTable = function () {
    let arr = new Array(Vn.length + 1);

    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(Vt1.length + 1);

    }
    for (let i = 0; i < arr.length; i++) {     //首先放置非终结符号标签
        for (let j = 0; j < Vt1.length; j++) {
            if (i === 0) {
                arr[0][j + 1] = '    '+Vt1[j]+'    ';
                continue;
            }
            if (j === 0 && i <=Vn.length+1 ) {
                if(Vn[i-1].length === 2){
                    arr[i][0] = Vn[i-1];
                }else{
                    arr[i][0] = Vn[i-1]+' ';

                }

            }
        }
    }

    for (let i = 0; i < arr.length; i++) {     //放置终结符号标签
        for (let j = 0; j < Vt1.length+1; j++) {
            if(arr[i][j] === undefined){
                if(i!== 0 && j !== 0){
                    arr[i][j] = '  error  ';
                }else{
                    arr[i][j] = '  ';
                }

            }
        }
    }



    G.map(function (value,index) {
        let value1ArrLeft = value.split(['->'])[0];
        let value1ArrRight = value.split('->')[1];
        let valueAllSplit = value1ArrRight.split('|');  //分割'|'

        for(let i in valueAllSplit){
            let brr = valueAllSplit[i]; //所有的箭头右部

            if(Vn.indexOf(brr[0]) !== -1 ){
                for(let j in first[brr[0]]){
                    let a = Vn.indexOf(value1ArrLeft);
                    let b = Vt1.indexOf(first[value1ArrLeft][j]);
                    arr[a+1][b+1] ='  '+value1ArrLeft+'->'+brr;

                }

                if(first[brr[0]].indexOf('ε') !== -1){
                    for(let j in follow[value1ArrLeft]){
                        let a = Vn.indexOf(value1ArrLeft);
                        let b = Vt1.indexOf(follow[value1ArrLeft][j]);
                        arr[a+1][b+1] =value1ArrLeft+'->'+brr;
                    }
                }

            }

            if(Vt1.indexOf(brr[0]) !== -1){
                let a = Vn.indexOf(value1ArrLeft);
                let b = Vt1.indexOf(brr[0]);
                arr[a+1][b+1] =value1ArrLeft+'->'+brr;
            }
            if(brr[0] === 'ε'){
                for(let j in follow[value1ArrLeft]){

                    let a = Vn.indexOf(value1ArrLeft);
                    let b = Vt1.indexOf(follow[value1ArrLeft][j]);
                    arr[a+1][b+1] =value1ArrLeft+'->'+brr;
                }
            }

        }
    });

    let str = ' ';
    for (let i = 0; i < arr.length; i++) {
        str +='\n';
        for (let j = 0; j < Vt1.length+1; j++) {
            str += arr[i][j];
        }
    }
    // console.log(str);
    return arr;
};

//非终结符求first集
Vn.map(function (value) {
    getFirst(value);
});

//非终结符求follow集
Vn.map(function (value) {
    getFollow(value);
});

//正式开始符号分析
let analysisProgram = function () {
    let stack = [];  //栈
    let X;  // 栈顶符号
    let a;  //当前输入符号
    stack.push('#');    //#入栈
    stack.push('E');

    let inputArr = [];
    for(let i in inputString){
        inputArr.push(inputString[i]);
    }


    X = stack[stack.length-1];
    a = inputArr[0];


    let num = 0;
    console.log("步骤       符号栈       输入串     所用产生式");
    while(inputArr.length>0){
        num++;
        X = stack[stack.length-1];  //取栈顶符号
        a = inputArr[0];

        if(X === a && X==='#'){
            console.log( num+ '      '+stack+'      '+inputArr+'  ');
            console.log('accept!');
            return;
        }else if(X === a && X !== '#'){

            console.log(num+ '      '+stack+'      '+inputArr+'  ');
            stack.pop();
            a = inputArr.shift();

        }else if(Vn.indexOf(X) !== -1){     //非终结符号
            let x = Vn.indexOf(X);
            let y = Vt1.indexOf(a);

            x++;
            y++;

            if(PredictAnalyticalTable[x][y] === 'error'){
                console.log( num+'      '+stack+'      '+inputArr+'  '+'error');
                console.log(false);
                return false
            }else{
                console.log(num+ '      '+stack+'      '+inputArr+'  '+PredictAnalyticalTable[x][y]);

                let item = PredictAnalyticalTable[x][y].split('->')[1];
                if(item === 'ε'){   //为ε时候直接推进栈
                    // a = inputArr.shift();
                    stack.pop();

                }else{
                    stack.pop();
                    let itemArr = [];
                    for(let i in item){
                        itemArr[i] = item[i];
                    }
                    for(let i = itemArr.length-1;i>=0;i--){
                        if(itemArr[i] === '\''){
                            let str1 = itemArr[i-1] + '\'';
                            stack.push(str1);
                            i--;
                        }else{
                            stack.push(itemArr[i]);
                        }
                    }
                }

            }

        }

    }
};

first['T\''].push('i');  //LL(1)文法的错误判断1
follow['T\''].push('ε');  //LL(1)文法的错误判断2

let PredictAnalyticalTable = getPredictAnalyticalTable();

console.log('文法消除左递归之后的文法G:');
console.log(G);
console.log('-----------------分界线-----------------');
console.log('first:');
console.log(first);
console.log('follow:');
console.log(follow);
console.log('-----------------分界线-----------------');
let flag = chargeLL1();
if (flag === -1) {
    console.log("该文法不是LL(1)文法");
} else {
    console.log("该文法是LL(1)文法,开始进行预测分析表的构造....");
    console.log('-----------------分界线-----------------');
    console.log('预测分析表:');
    let str = ' ';
    for (let i = 0; i < PredictAnalyticalTable.length; i++) {
        str +='\n';
        for (let j = 0; j < Vt1.length+1; j++) {
            str += PredictAnalyticalTable[i][j];

        }
    }
    console.log(str);
    console.log('-----------------分界线-----------------');
    console.log("模拟分析过程");
    analysisProgram();
}

