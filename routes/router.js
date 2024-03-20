// Dependencies
const express = require("express");
const i18n = require("i18n");

// Router setup
const router = express.Router();

// Configure i18n
i18n.configure({
    locales: ["en", "jp"], // Add your desired languages here, e.g., English and Swedish
    directory: __dirname + "/../locales",
    defaultLocale: "en",
    objectNotation: true,
});

// Use i18n middleware
router.use(i18n.init);

router.get("/language/:locale", (req, res) => {
    const { locale } = req.params;
    i18n.setLocale(req, locale);
    res.cookie("locale", locale);
    res.redirect("/");
});

router.get("/", (req, res, next) => {
    console.log(req.getLocale()); // This will output the current locale in the console
    res.render("index", {
        title: "Solar Enterprises",
        routename: "home",
        csrfToken: req.csrfToken(),
        i18n: res.locals,
    });
    console.log(req.getLocale()); // Should output the current locale
});

// Export router
module.exports = router;

// end of file