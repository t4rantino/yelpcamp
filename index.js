const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

function logError(error) {
  console.log('Something went wrong...');
  console.log(error);
}

const DATABASE_NAME = 'yelpcamp';
mongoose.connect(`mongodb://localhost:27017/${DATABASE_NAME}`)
  .catch(error => logError(error));

const connection = mongoose.connection;
connection.on('error', error => logError(error));
connection.on('open', () => console.log(`Connected to ${DATABASE_NAME} database.`));
connection.on('disconnected', () => console.log(`Disconnected from ${DATABASE_NAME} database.`));

const app = express();
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/campgrounds', async (request, response) => {
  const camps = await Campground.find({});
  response.render(
    'campground/index',
    { camps, title: 'Campgrounds - YelpCamp' }
  );
});

app.get('/campgrounds/new', (request, response) => {
  response.render(
    'campground/new',
    { title: 'Add Campground - YelpCamp' }
  );
});

app.post('/campgrounds', async (request, response) => {
  const { campground } = request.body;
  const camp = new Campground(campground);
  await camp.save();
  response.redirect(`/campgrounds/${camp.id}`);
});

app.get('/campgrounds/:id', async (request, response) => {
  const { id } = request.params;
  const camp = await Campground.findById(id);
  response.render(
    'campground/show',
    { camp, title: `${camp.title} - YelpCamp` });
});

app.get('/campgrounds/:id/edit', async (request, response) => {
  const { id } = request.params;
  const camp = await Campground.findById(id);
  response.render(
    'campground/edit',
    { camp, title: 'Edit Campground Details - YelpCamp' });
});

app.patch('/campgrounds/:id', async (request, response) => {
  const { id } = request.params;
  const { campground } = request.body;
  await Campground.findByIdAndUpdate(
    id,
    campground,
    { new: true, runValidators: true }
  );
  response.redirect(`/campgrounds/${id}`);
});

app.delete('/campgrounds/:id', async (request, response) => {
  const { id } = request.params;
  const camp = await Campground.findById(id);
  await Campground.deleteOne({ _id: camp._id });
  response.redirect('/campgrounds');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening at port ${PORT}...`));