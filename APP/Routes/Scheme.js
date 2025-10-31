const router = require("express").Router();

const { Create, Read, Patch, Update } = require("../Controller/Scheme/Crud");
const List = require("../Controller/Scheme/List");
const ListMultiModel = require("../Controller/Scheme/ListMultiModel");
const Search = require("../Controller/Scheme/Search");
const Relax = require("../Controller/Scheme/Relax");
const Csv = require("../Controller/Scheme/Csv");
const PdfGen = require("../Controller/Scheme/Pdf");
const PostMan = require("../Controller/Scheme/Postman");

const MulterMultiFiles = require("../Middleware/Multer/multerMultiFiles");
const MulterSingleFile = require("../Middleware/Multer/multerSingleFile");


router.get("/", (req, res) => {
  res.status(200).json({ message: "Scheme routes active " });
});


router.get("/list-multi", ListMultiModel);
router.get("/list/:model", List);


router.get("/fuse-search/:model", Search.FuseSearch);


router.get("/relax/read", Relax.Read);
router.put("/relax/multi/:model", MulterMultiFiles, Relax.Upsert);


router.get("/csv/template/:model", Csv.Template);
router.get("/csv/generate/:model", Csv.Generate);
router.put("/csv/upload/:model", MulterSingleFile, Csv.Upload);


router.get("/pdf/generate/:model", PdfGen);


router.post("/postman/generate", PostMan);


router.post("/:model", Create);
router.patch("/:model", Patch);
router.put("/:model", Update);
router.get("/:model", Read);

module.exports = router;
