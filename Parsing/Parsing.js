//语法分析器


//文法定义
let G = ['S->AB', 'S->bC', 'A->ε', 'A->b', 'B->ε', 'B->aD', 'C->AD', 'C->b', 'D->aS', 'D->c'];

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
    // for (let value in first) {
    //     G.map(function (value1) {
    //         let value1ArrLeft = value1.split(['->'])[0];
    //         let value1ArrRight = value1.split('->')[1];
    //         if (value1ArrLeft === value && Vt.indexOf(valueAllSplit[i) !== -1) {  //若X∈VT，则FIRST(X)＝{X}
    //             first[value].push(valueAllSplit[i);
    //         }
    //         if (value1ArrLeft === value && Vn.indexOf(valueAllSplit[i) !== -1) {  //若是非终结符X，能推导出以终结符a开头的串，那么这个终结符a属于FIRST（X），若X能够推导出空符号串ε，那么空符号串ε也属于X的FIRST集
    //
    //         }
    //     })
    // }

    G.map(function (value1) {
        let value1ArrLeft = value1.split(['->'])[0];
        let value1ArrRight = value1.split('->')[1];
        let valueAllSplit = value1ArrRight.split('|');
        for (let i in valueAllSplit) {
            let arr = valueAllSplit[i];
            if (value1ArrLeft === value && Vt.indexOf(arr[0]) !== -1) {  //若X∈VT，则FIRST(X)＝{X}
                if (first[value].indexOf(arr[0]) === -1) {
                    if (arr[0] !== 'ε') {
                        first[value].push(arr[0]);
                        if (callback) {
                            callback(1, arr[0]);
                        }
                    } else {  //可以推出空串
                        if (callback) {
                            callback(2, 'ε');
                        }
                    }
                }
            } else if (value1ArrLeft === value && Vn.indexOf(arr[0]) !== -1) {  //若是非终结符X，能推导出以终结符a开头的串，那么这个终结符a属于FIRST（X），若X能够推导出空符号串ε，那么空符号串ε也属于X的FIRST集
                getFirst(arr[0], function (situation, callValue) {
                    if (situation === 1) {
                        if (first[value].indexOf(callValue) === -1) {
                            first[value].push(callValue);
                            if (callback) {
                                callback(1, callValue);
                            }
                        }
                    } else if (situation === 2) {
                        if (first[value].indexOf(callValue) === -1) {
                            first[value].push(callValue);
                            if (callback) {
                                callback(3, callValue);
                            }
                        }
                    }
                });

                let flag = [];    //若X∈VN；Y1，Y2，…，Yi∈VN，且有产生式X→Y1 Y2 … Yn；当Y1 Y2 … Yn-1都能推导出ε时，则FIRST(Y1)、FIRST(Y2)、…、FIRST(Yn-1)的所有非空元素和FIRST(Yn) 包含在FIRST(X)中
                for (let i in arr) {
                    if (Vn.indexOf(arr[i]) !== -1) {  //属于非终结符
                        getFirst(arr[i], function (situation) {
                            if (situation === 2) {  //有空串
                                flag.push(1);
                            }else{

                            }
                        })
                    }
                }

                let allFlag = 0;
                flag.map(function (val) {
                    allFlag+=val;
                });

                if(allFlag === arr.length){
                    getFirst();
                    for (let i in arr) {
                        getFirst(arr[i]);
                        first[arr[i]].map(function (val) {
                            if (first[value].indexOf(val) === -1) {
                                first[value].push(val);
                                if (callback) {
                                    callback(4, val);
                                }
                            }

                        })
                    }
                }

            }
        }
    })
};

Vn.map(function (value) {
    getFirst(value);
});

console.log(G);
console.log(Vt);
console.log('-----------------分界线-----------------');
console.log(first);


//消去左递归
