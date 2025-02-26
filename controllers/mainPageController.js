const { validationResult } = require('express-validator');
const { signUpValidator, logInValidator } = require('./validator');
const db  = import('../db/queries.js');

exports.handleMainPage = async (req, res) => {
  if (req.isAuthenticated()) {
    res.locals.currentUser = req.user
    const folders = await (await db).getFolders(req.user.id)
    return res.render('mainPageAuth', {folders: folders})
} 
res.render('mainPage')
}

exports.signUpQuery =  [
    signUpValidator,
    async (req, res) => {
        const errors = validationResult(req);
        const { firstName, lastName, nickName, password } = req.body;
        if (!errors.isEmpty()) {
          return res.status(400).render("signUp", {
            title: "Create user",
            errors: errors.array()
          })
        }
        const test = await (await db).checkNickname(nickName)
        if (test.length > 0) {
          return res.status(400).render('signUp', {
            errors: [{msg: 'Nickname already exist!'}]
          })
        }
        (await db).signUpQueryDB(firstName, lastName, nickName, password);
        res.redirect('logIn')
      }
];

exports.logInQuery = [
  logInValidator, 
  async (req, res, next) => {
    const errors = validationResult(req);
    const { nickName, password } = req.body;
    if (!errors.isEmpty()) {
      return res.status(400).render("logIn", {
        title: 'Login user',
        errors: errors.array()
      });
    }
    next()
  }
];
