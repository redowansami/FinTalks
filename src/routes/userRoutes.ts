import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

router.post("/", UserController.create);
router.get("/", UserController.findAll);
router.get("/:userId", UserController.findOne);
router.put("/:userId", UserController.update);
router.patch("/:userId", UserController.update);
router.delete("/:userId", UserController.delete);

export default router;