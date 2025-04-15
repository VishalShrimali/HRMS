import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMembersToGroup,
  addLeadToGroup 
} from "../controllers/leadsGroup.controllers.js"; 

const groupRouter = express.Router();

// CRUD Routes
<<<<<<< HEAD
groupRouter.get("/", authorizeRole, getGroups); // Explicit "/"
groupRouter.get("/:id", authorizeRole, getGroupById);
groupRouter.post("/creategroup", createGroup);
=======
groupRouter.get("" ,getGroups);
groupRouter.get("/:id", getGroupById);
groupRouter.post("/create", createGroup);
>>>>>>> 242b43d564d65e279c16418da246f70fa3f4e42a
groupRouter.put("/:id", updateGroup);
groupRouter.delete("/:id", deleteGroup);
groupRouter.put('/:id/:uid' , addLeadToGroup );

// Member management route (match controller)
// groupRouter.put("/:id/members", addMembersToGroup);

export default groupRouter;