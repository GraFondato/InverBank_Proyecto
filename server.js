// require's
const express = require('express');
// const path = require('path');
// const methodOverride = require('method-override');
// const cookieParser = require('cookie-parser');
// const logger = require('morgan');
// const session = require('express-session');
// const cors = require('cors');


// express()
const app = express();

// app.use(express.json());
// app.use(session({
//     secret: "It's a secret",
//     resave: false,
//     saveUninitialized: false, 
// })) ;
// app.use(methodOverride('_method')) 
// app.use(express.static(path.resolve(__dirname,  '../public'))); 
// app.use(express.urlencoded({ extended: false })); 
// app.use(logger('dev'));
// app.use(cookieParser());
// app.use(cors());


app.use((req,res,next) => {
    res.status(404).render('../src/views/not-found')
})


// levantar el servidor
let port = process.env.PORT || 3030
app.listen(port, () => console.log(`Server is running on port ${port}`));
