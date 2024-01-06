const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const date =  require(__dirname + "/date.js");
const _ = require('lodash');
const mongoose = require('mongoose');
const path = require('path');



app.set('view engine', 'ejs');
// app.use(express.static("public"));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://ankurgour2003:Ankur123@todolist.veqnz0b.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true
});

const itemsSchema = mongoose.Schema({
    name : String
});

const Items = mongoose.model('Items',itemsSchema);


const listSchema = mongoose.Schema({
    name : String,
    items : [itemsSchema]

});

const List = mongoose.model('List',listSchema);

const item1 = new Items({
    name : "Welcome to the To-Do List",

})

const item2 = new Items({
    name : "Add a list of works you have to do",
});

const item3 = new Items({
    name : "If you complete your task just delete it by checking that left box",
});

const defaultItems = [item1, item2, item3];
const day = date.getDate();
console.log(day);
// app.get("/",async(req,res)=>{

//     await Items.find({},(error, item)=>{
//         if(item.length===0){
//             Items.insertMany(defaultItems,(error)=>{
//                 if(error){
//                     console.log(error);
//                 }
//                 else{
//                     console.log("Item added successfully");
//                 }
                
//             });
//             res.redirect("/")
//         }
//         else{
//             res.render("index",{
//                 title:day,
//                 todoItems : item
//             });
//         }
//     })
// })
app.get("/", async (req, res) => {
    try {
        const items = await Items.find({});

        if (items.length === 0) {
            await Items.insertMany(defaultItems);
            console.log("Items added successfully");
            return res.redirect("/");
        } else {
            res.render("index", {
                title: day,
                todoItems: items
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/:name", async (req, res) => {
    try {
    //   const Name = _.capitalize(req.params.name);
    // console.log("name: " + req.params.name);
  
      const foundList = await List.findOne({ name: req.params.name });
    //   console.log("foundList", foundList);
  
      if (foundList==null) {
        const list = new List({ name: req.params.name,items:defaultItems });
        await list.save();
        res.redirect("/" + req.params.name );
      } else {
        res.render("index", {
          title: req.params.name,
          todoItems: foundList.items
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("An error occurred");
    }
  });
  





app.post('/delete',async(req,res)=>{
    const itemId = req.body.checkbox;
    // console.log("item",itemId);
    const listname = req.body.listName;
    // console.log(listname);
    // const item = await Items.findById(itemId);
    if(listname==day){
       try{
        const result = await Items.deleteOne({_id: itemId});
        if(result.deletedCount===1){
            console.log("Task deleted successfully");
            res.redirect("/");  
            
        }
        else{
            console.log("Task not found or not deleted");
            res.redirect("/");
        }
       }
       catch(error){
        console.log(error);

    }
}
    else{
    //     List.findOneAndUpdate({
    //         name: listname },
    //         {
    //             $pull:{
    //                 items:{
    //                     _id : itemId
    //                 }
    //             }
    //         },function(erro,foundList){
    //             if(!erro){
    //                 res.redirect("/"+listname);
    //             }
    //             else{
    //                 console.log()
    //             }
    //         }

    // )
    List.findOneAndUpdate(
        { name: listname },
        {
          $pull: {
            items: {
              _id: itemId
            }
          }
        }
      )
        .then(foundList => {
          if (!foundList) {
            console.log("List not found");
            res.redirect("/" + listname);
          } else {
            res.redirect("/" + listname);
          }
        })
        .catch(error => {
          console.error(error);
          // Handle the error
          res.status(500).send("An error occurred");
        });
      
}


    


});
app.post("/",async(req,res)=>{
    const itemName = req.body.todo;
    const listname = req.body.list;
    // const Name = _.capitalize(listname);
    const item  = new Items({
        name : itemName,
    })
    if(listname==day){
        item.save();
        res.redirect("/");
    }
    else{
      try{
        const foundlist = await List.findOne({name:listname})
        console.log("foundlist",foundlist);
        if(foundlist){
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/" + listname);
        }

      }
      catch(err){
        console.log(err.message);

      }
      

    }

})


app.listen(process.env.PORT || 3001, () => {
    console.log("Server is listening at port 3001");
  })