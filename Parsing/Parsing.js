//语法分析器


//文法定义
let G = ['S->AB', 'S->bCA', 'A->b', 'A->ε', 'B->ε', 'B->aD', 'C->ADE', 'C->b', 'D->aS', 'D->c', 'D->ε', 'E->e'];

// let G = ['E->E+T|T', 'T->T*F|F', 'F->(E)|i'];
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

//求first集
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

//求follow集
let getFollow = function () {
    Vn.map(function (value) {
        follow[value].push('#');    //先加入#
    });


    G.map(function (value1) {   //一行一行分析
        let value1ArrLeft = value1.split(['->'])[0];
        let value1ArrRight = value1.split('->')[1];
        let valueAllSplit = value1ArrRight.split('|');  //分割'|'


        for (let i in valueAllSplit) {
            let arr = valueAllSplit[i];//有的箭头右部

            for(let j in arr){


                j= parseInt(j); //改变类型

                if (j > 0 && j < arr.length - 1 && Vt.indexOf(arr[j - 1]) !== -1 && Vn.indexOf(arr[j]) !== -1 && Vn.indexOf(arr[j + 1]) !== -1) {   //对于产生式：A->aBC,将除去空集e的First（C）加入Follow（B）中;
                    if(arr[j] === 'C'){
                        console.log(arr[j]);
                    }
                    for (let k in first[arr[j + 1]]) {  //第一个非终结符号的first集合加入
                        k = parseInt(k);
                        if (follow[arr[j]].indexOf(first[arr[j + 1]][k]) === -1 && first[arr[j + 1]][k] !== 'ε') {
                            follow[arr[j]].push(first[arr[j + 1]][k]);
                        }
                    }
                }
            }


        }
    });
};

Vn.map(function (value) {   //非终结符求first集
    getFirst(value);

});

//非终结符求follow集
getFollow();


console.log(G);
console.log('-----------------分界线-----------------');
console.log('first:');
console.log(first);
console.log('follow:');
console.log(follow);



