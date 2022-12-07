var uid = null;

AFRAME.registerComponent("markerhandler", {

init: async function() {
var toys = await this.getToys();

if (uid === null) {
  this.askUserId();
}

this.el.addEventListener("markerFound", () => {
if (uid !== null) {
  var markerId = this.el.id;
  this.handleMarkerFound(toys, markerId);
}
});

this.el.addEventListener("markerLost", () => {
  this.handleMarkerLost();
});
},

askUserId: function() {
var iconUrl ="https://raw.githubusercontent.com/whitehatjr/ar-toy-store-assets/master/toy-shop.png";

swal({
title: "Welcome to Toy Shop!!",
icon: iconUrl,
content: {
element: "input",
attributes: {
placeholder: "Type your uid Ex:( U01 )"
}
}
}).then(inputValue => {
uid = inputValue;
});
},

handleMarkerFound: function(toys, markerId) {
var toy = toys.filter(toy => toy.id === markerId)[0];

if (toy.unavailable_days) {
  console.log(toy.unavailable_days)
swal({
icon: "warning",
title: toy.id.toUpperCase(),
text: "This toy is out of stock!!!",
timer: 2500,
buttons: false
});
} else {

var model = document.querySelector(`#model-${toy.id}`);
model.setAttribute("position", toy.model_geometry.position);
model.setAttribute("rotation", toy.model_geometry.rotation);
model.setAttribute("scale", toy.model_geometry.scale);
model.setAttribute("visible", true);

var mainPlane = document.querySelector(`#main-plane-${toy.id}`);
mainPlane.setAttribute("visible", true);

var buttonDiv = document.getElementById("button-div");
buttonDiv.style.display = "flex";

var orderButton = document.getElementById("order-button");
var orderSummaryButtton = document.getElementById("order-summary-button");

orderButton.addEventListener("click", () => {
  uid = uid.toUpperCase();
  this.handleOrder(uid, toy);

  swal({
  icon: "https://i.imgur.com/4NZ6uLY.jpg",
  title: "Thanks For Order !",
  text: "",
  timer: 2000,
  buttons: false
  });
});

orderSummaryButtton.addEventListener("click", () => {

swal({
icon: "warning",
title: "Order Summary",
text: "Work In Progress"
});
});
}
},

handleOrder: function(uid, toy) {
  
firebase
.firestore()
.collection("users")
.doc(uid)
.get()
.then(doc => {

var details = doc.data();

if (details["current_orders"][toy.id]) {

details["current_orders"][toy.id]["quantity"] += 1;
var currentQuantity = details["current_orders"][toy.id]["quantity"];
details["current_orders"][toy.id]["subtotal"] = currentQuantity * toy.price;

} else {
details["current_orders"][toy.id] = {
item: toy.id,
price: toy.price,
quantity: 1,
subtotal: toy.price * 1
};
}

details.total_bill += toy.price;

firebase
.firestore()
.collection("users")
.doc(doc.id)
.update(details);

});
},
  
getToys: async function() {
return await firebase

.firestore()
.collection("toys")
.get()
.then(snap => {
  return snap.docs.map(doc => doc.data());
});
},

handleMarkerLost: function() {

var buttonDiv = document.getElementById("button-div");
buttonDiv.style.display = "none";

}
});