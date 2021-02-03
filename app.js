//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const names = []

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema = {

  name: String,

  items: [itemsSchema]

}

const List = mongoose.model("List", listSchema)


app.get("/", function(req, res) {

  Item.find(function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {});
      res.redirect("/");
    } else {


      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  })
})



app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;



  List.findOne({
    name: customListName
  }, function(err, foundList) {

    if (!foundList) {
      //create a new list
      const list = new List(

        {
          name: customListName,
          items: defaultItems
        })
      list.save();
      res.redirect("/" + customListName);

    } else {
      //Show an existing list
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      })

    }
  });


});



app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const title = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (title === "Today") {

    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name:title},function(err,result){

result.items.push(newItem);
result.save();
res.redirect("/"+title);

    })


  }




});

app.post("/delete", function(req, res) {

const Title= req.body.listName;
if(Title==="Today"){
  Item.deleteOne({
    _id: req.body.checkbox
  }, function(err) {});

  res.redirect("/");
} else {

List.findOneAndUpdate({name:req.body.listName},{$pull:{items:{_id:req.body.checkbox}}},function(err,result){


})
res.redirect("/"+ req.body.listName)

}


})





app.listen(3000, function() {
  console.log("Server started on port 3000");
})
