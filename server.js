var express=require("express");
const fs = require('fs');
const yaml = require('js-yaml');
var app=express();
const session = require('express-session');
var sess = require('sess')
// var path = require('path');
// var cors = require("cors")
var bodyparser=require("body-parser");
var mongojs = require('mongojs');
const { chownSync } = require("fs");
const bcrypt = require('bcrypt');

app.set("view engine","ejs");
// app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));
app.use(express.json())
// app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))

var cs="mongodb+srv://mahesh:mahesh@cluster0.tttc2.mongodb.net/Wireframe?retryWrites=true&w=majority"
var db=mongojs(cs,["users"])

// Session Setup
app.use(session({
    secret: 'ssshhhhh',
    resave: true,
    saveUninitialized: true
}))
var sess;

app.get("/",function(req,res){
    res.sendFile(__dirname+"/public/index.html");
})


app.post('/login', async (req,res) => {
     sess = req.session
     sess.username = req.body.uname,
     sess.password = req.body.pswd

     db.users.find({}, async (err,docs) => {
        var a = docs
        const user = a.find(user => user.username === req.body.uname) // particular user
         if(user == null){ // if no user is found in database
             res.send("No user found")
         }
         //console.log(req.body.pswd) // original password
         //console.log(user.password) // password stored in database which is encrypted password
         var c = await bcrypt.compare(req.body.pswd,user.password)
        //console.log(c) // displays true or false
         if(c){ // if true
            var d = {
                 username:req.body.uname,
                 password:user.password
             }
             db.users.find(d,function(err,docs){
                    if(err){
                        res.send("sorrry")
                    } else {
                        res.render("page",{data:docs});
                    }
            })
        } else { // if false
             res.send("Please check your password")
        }
    })
    
})

app.get('/newquestion', function(req, res) {
    res.render("newpage");
});

app.get('/newamend', function(req, res) {
    res.render("amendquestion");
});

app.get('/newentity', function(req, res) {
    res.render("entity");
});

app.get('/createque', function(req, res) {
    var d = {
        username:sess.username
    }
    var db1 = mongojs(cs,["department"])
    var arr = []
    db.questions.find(d,function(err,doc){
        arr.push(doc);
    })
    db1.department.find(d,function(err,docs){
        arr.push(docs);
    })
    db1.individualquestions.find(d,function(err,docs){
        arr.push(docs);
        console.log(arr)
        res.render("askingquestion",{data:arr});
    })
});

app.get('/createentity', function(req, res) {
    var d = {
        username:sess.username
    }
    db.questions.find(d,function(err,doc){
        // console.log(sess.username);
         // console.log(doc);
        res.render("newentityequipment",{data:doc});
    })
});

app.get('/createamend', function(req, res){
    var d = {
        username:sess.username
    }
    var arr = []
    db.questions.find(d,function(err,doc){
        arr.push(doc)
    })
    db.groupquestions.find(d,function(err,docs){
        arr.push(docs)
        console.log("tHIS is arr")
        console.log(arr)
        res.render("amendequipment1",{data:arr});
    })
});

app.post("/groupquestions",function(req,res){
    console.log(req.body.dictionary)
})

app.post('/question',function(req,res){
    sess = req.session;
    var dbs=mongojs(cs,["questions"])

    var data = req.body.text
    fs.appendFileSync('data.yml',data, 'utf8');
    console.log("Data is appended to file successfully.")

    var d = {
        username:sess.username,
        answer:req.body.button,
        question:req.body.question,
        intent:req.body.input
    }

    dbs.questions.insert(d,function(err,docs){
        if(err){
            res.send('something went wrong')
        }else{
            res.send('Successfully added question')
        }
    })
    // console.log(req.body.department);
    var d1 = {
        username:sess.username,
        department:req.body.department
    }
    dbs.department.insert(d1,function(err,docs){
        if(err){
            res.send('something went wrong')
        }
    })

    var d2 = {
        username:sess.username,
        dictionary:req.body.dictonary
    }
    dbs.groupquestions.insert(d2,function(err,docs){
        if(err){
            res.send('something went wrong')
        }
    })
    
})

app.post("/individualquestion",function(req,res){
    var db = mongojs(cs,["individualquestions"])
    var d = {
        username:sess.username,
        question:req.body.individualquestion,
    }
    db.individualquestions.insert(d,function(err,docs){
        if(err){
            res.send('something went wrong')
        }
    })
})

app.post('/amend',function(req,res) {
    sess = req.session;
    var db = mongojs(cs,["questions"]);
    console.log(req.body.intent)
    console.log(req.body.entity)
    console.log(req.body.content)
    console.log(req.body.link)
    // var a = JSON.parse(req.body.equipment);
    // var b = JSON.parse(req.body.question);
    // for(var i=0;i<b.length;i++){
    //     b[i].name = b[i].name.trim();
    // }
    // for(var i=0;i<a.length;i++){
    //     a[i].name = a[i].name.trim();
    // }
    // console.log(b);
    // var arb = [];
    // for(var i=0;i<b.length;i++){
    //     if(arb.length>=1){
    //         var coun = true
    //         var na = b[i].name;
    //         var l = na.indexOf("(");
    //         var r = na.indexOf(")");
    //         var equ = na.slice(l+1,r);
    //         var que = na.slice(0,l)
    //         var d = {}
    //         for(var j=0;j<arb.length;j++){
    //             if(arb[j].question==que){
    //                 coun = false;
    //                 var d1 = {}
    //                 d1["name"] = equ
    //                 d1["content"] = b[i].answers
    //                 d1["link"] = b[i].link
    //                 arb[j].answer.push(d1)
    //             }
    //         }
    //         if(coun){
    //             d["intent"] = que
    //             d["answer"] = []
    //             var d1 = {}
    //             d1["name"] = equ
    //             d1["content"] = b[i].answers
    //             d1["link"] = b[i].link
    //             d["answer"].push(d1)
    //             arb.push(d)
    //         }
    //     }
    //     else{
    //         var na = b[i].name;
    //         var l = na.indexOf("(");
    //         var r = na.indexOf(")");
    //         var equ = na.slice(l+1,r);
    //         var que = na.slice(0,l)
    //         var d = {}
    //         d["intent"] = que
    //         d["answer"] = []
    //         var d1 = {}
    //         d1["name"] = equ
    //         d1["content"] = b[i].answers
    //         d1["link"] = b[i].link
    //         d["answer"].push(d1)
    //         arb.push(d)
    //     }
    // }
    // console.log(arb)

 // async function fun1(y){
        // for(var t=0;t<b.length;t++){
        //     var que = b[t].name
        //     var l = que.indexOf("(");
        //     var r = que.indexOf(")");
        //     var equ = que.slice(l+1,r)
        //     que = que.slice(0,l)
        //     if(que==y[0].question){
        //         var ans = JSON.parse(y[0].answer)
        //         for(var k=0;k<ans.length;k++){
        //             var serequ = ans[k].name
        //             serequ = serequ.replace("intent_","")
        //             if(serequ==equ){
        //                 ans[k].content = b[t].answers
        //                 ans[k].link = b[t].link
        //                 var search = {
        //                     username:sess.username,
        //                     question:que
        //                 }
        //                 var up = {$set: {answer:JSON.stringify(ans)}}
        //                 console.log(up);
        //                  db.questions.update(search,up);
        //             }
        //         }
        //     }
        // }
        // for(const t of b){
        //     var que = t.name
        //     var l = que.indexOf("(");
        //     var r = que.indexOf(")");
        //     var equ = que.slice(l+1,r)
        //     que = que.slice(0,l)
        //     if(que==y[0].question){
        //         var ans = JSON.parse(y[0].answer)
        //         for(const k of ans){
        //             var serequ = k.name
        //             serequ = serequ.replace("intent_","")
        //             if(serequ==equ){
        //                 console.log(serequ,equ)
        //                 k.content = t.answers
        //                 k.link = t.link
        //                 var search = {
        //                     username:sess.username,
        //                     question:que
        //                 }
        //                 var up = {$set: {answer:JSON.stringify(ans)}}
        //                 console.log("hi count this");
        //                 console.log(k);
        //                 console.log(up);
        //                 await db.questions.updateOne(search,up);
        //             }
        //         }
        //     }
        // }
    // }



//  async function two(b1){
    
//     for(const i of b1) {
//         var s = i.intent
//         s = "c_"+s
//         var x = {
//             username:sess.username,
//             intent:s
//         }
//        await db.questions.find(x,async function(err,doc){
//             console.log("This is i")
//             console.log(i);
//             console.log(doc);
//             var search = {
//                 username:sess.username,
//                 intent:s
//             }
//             var up = {$set: {answer:JSON.stringify(i.answer)}}
//             console.log(up);
//             await db.questions.updateOne(search,up);
//         })
//     }
// }
// two(arb)

    

    
    
    
})

app.post('/amend1',function(req,res) {
    console.log(req.body.intent);
    console.log(req.body.equipment);
    console.log(req.body.status)

})

app.post('/entity',function(req,res){
    sess = req.session;
    var dbs = mongojs(cs,["questions"])
    var an = JSON.parse(req.body.answer);
    for(var i=0;i<an.length;i++){
        var inte = an[i].intent;
        delete an[i].intent
        var arr = [];
        arr.push(an[i])
        var d = {
            username:sess.username,
            answer: JSON.stringify(arr),
            question:req.body.question,
            intent: inte,
        }
        console.log(inte)
        console.log(d)
        // dbs.questions.insert(d,function(err,docs){
        //     if(err){
        //         res.send('something went wrong')
        //     }
        // })
    }
})

app.listen(process.env.PORT || 3000, function(){
    console.log('Your node js server is running');
});
