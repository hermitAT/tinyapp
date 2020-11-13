# tinyApp Project

tinyApp is a full stack web application created by hermitAT (Adam Thorne) built with Node and Express that allows users to shorten long URLs (à la bit.ly). 

## Final Product

!["Screenshot of URLs page without an active user"](https://github.com/hermitAT/tinyapp/blob/master/docs/urls-page-nologin.png?raw=true)
!["Screenshot of URLs page with URLs created by user"](https://github.com/hermitAT/tinyapp/blob/master/docs/urls-page.png?raw=true)
!["Screenshot of URL edit page"](https://github.com/hermitAT/tinyapp/blob/master/docs/edit-url-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- morgan

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Status Code messages now contain 100% more HTTPCats for your viewing pleasure.
- Once tinyURLs have been created by the user, you may click hyperlinks directly on the /urls page to visit the associated longform URLs.
- Only users who have logged in may access pages used to create, edit or view tinyURLs stored in the database.