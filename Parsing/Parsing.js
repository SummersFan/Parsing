//语法分析器


//文法定义
// let G = ['S->AB', 'S->bCA', 'A->b', 'A->ε', 'B->ε', 'B->aD', 'C->ADE', 'C->b', 'D->aS', 'D->c', 'D->ε', 'E->e'];

let G = ['E->E+T|T', 'T->T*F|F', 'F->(E)|i'];
let Vn = [];    //非终结符集合
let Vt = [];    //终结符结合
let GL = [];    //文法左部
let RL = [];    //文法右部
let first = {};  //first集
let follow = {};    //follow集


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
                    } else {  //可以推出空串
                        first[value].push(arr[0]);
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

                    for(let l in first[char]){
                        if(first[char1] === undefined|| first[char1] === undefined){
                            continue;
                        }
                        if(first[char1].indexOf(first[char][l]) !== -1){
                            flag = -1;
                            return -1;
                        }
                    }
                }
            }


        }

        for(let i in first[value1ArrLeft]){

            if(follow[value1ArrLeft].indexOf(first[value1ArrLeft][i]) !== -1 ){

                flag = -1;
                return -1;
            }
        }
    });
    return flag;
};

//预测分析表构造函数
let getPredictAnalyticalTable = function () {
  let arr = new Array(Vt.length+1);

  for(let i = 0 ;i < arr.length+1;i++){
      arr[i]= new Array(Vn.length+1);
      for(let j=0;j<Vn.length;j++){      //二维长度为5
          arr[i][j]=1;
      }

  }
  console.log(arr);
};

//非终结符求first集
Vn.map(function (value) {
    getFirst(value);
});

//非终结符求follow集
Vn.map(function (value) {
    getFollow(value);
});

// first['T\''].push('i');  //LL(1)文法的错误判断1
// follow['T\''].push('ε');  //LL(1)文法的错误判断2


getPredictAnalyticalTable();
console.log('文法消除左递归之后的文法G:');
console.log(G);
console.log('-----------------分界线-----------------');
console.log('first:');
console.log(first);
console.log('follow:');
console.log(follow);
console.log('-----------------分界线-----------------');
let flag = chargeLL1();
if(flag === -1){
    console.log("该文法不是LL(1)文法");
}else{
    console.log("该文法是LL(1)文法,开始进行预测分析表的构造....");
}


