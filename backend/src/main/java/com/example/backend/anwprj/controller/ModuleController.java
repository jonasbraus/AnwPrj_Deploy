package com.example.backend.anwprj.controller;

import com.example.backend.anwprj.Database.DataBaseHandler;
import com.example.backend.anwprj.Module.Module;
import com.example.backend.anwprj.Users.User;
import com.example.backend.anwprj.Users.UserPermissions;
import com.example.backend.anwprj.Users.UserSessionIDHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Ein Modul hier entspricht nicht z.b. Analysis im Allgemeinen.
 * Es beschreibt die Verbindung zwischen einem Dozenten und Analysis in einem Speziellen Semester.
 */

@RestController
public class ModuleController
{
    private final DataBaseHandler db;

    {
        db = DataBaseHandler.getInstance();
    }


    /**
    GET
     A Module by its id
     */
    @CrossOrigin
    @GetMapping("/module/id")
    public ResponseEntity<Module[]> getModules(
            @RequestParam(name = "sessionid") String sessionID)
    {

        User user = UserSessionIDHandler.getUserBySessionID(sessionID);

        if (user != null)
        {
            Module[] modules = db.getModules(user.getId());
            if (modules != null)
            {
                return new ResponseEntity<>(modules, HttpStatus.OK);
            }

            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    /**
     GET
    Get A Module by the matching semester and user id (important for edit function in frontend)
     */
    @CrossOrigin
    @GetMapping("/module/suid")
    public ResponseEntity<Module[]> getModulesBySemesterUserID(@RequestParam(name = "sessionid") String sessionid, @RequestParam(name = "userid") String userid, @RequestParam(name = "semesterid") int semesterid)
    {
        User user = UserSessionIDHandler.getUserBySessionID(sessionid);
        String[] userIDSSplit = userid.split("a");
        int[] userIDS = new int[userIDSSplit.length];
        for(int i = 0; i < userIDS.length; i++)
        {
            userIDS[i] = Integer.parseInt(userIDSSplit[i]);
        }

        if(user != null && user.getPermissions() == UserPermissions.admin.getValue())
        {
            List<Module> result = new ArrayList<>();

            for(int i = 0; i < userIDS.length; i++)
            {
                result.add(db.getModuleBySemesterUserID(userIDS[i], semesterid));
            }

            return new ResponseEntity<>(result.toArray(new Module[0]), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    /**
     GET
     all modules from the database. (Not used now)
     */
    @CrossOrigin
    @GetMapping("/module/all")
    public ResponseEntity<Module[]> getModule(@RequestParam(name = "sessionid") String sessionid)
    {
        User u = UserSessionIDHandler.getUserBySessionID(sessionid);

        if (u != null)
        {
            if (u.getPermissions() == UserPermissions.admin.getValue())
            {
                return new ResponseEntity<>(db.getAllModules(), HttpStatus.OK);
            }
        }

        return null;
    }

    /**
     POST
     a new module entry. (When a user is selected in a semester.)
     */
    @CrossOrigin
    @PostMapping("/module")
    public ResponseEntity<Module> addModule(@RequestBody Module module, @RequestParam(name = "sessionid") String sessionID)
    {

        System.out.println("test1");
        User user = UserSessionIDHandler.getUserBySessionID(sessionID);

        if (user.getPermissions() == UserPermissions.admin.getValue())
        {
            Module m = db.addModule(module);
            if (m != null)
            {
                return new ResponseEntity<>(m, HttpStatus.OK);
            }

            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }


        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    /**
    PUT
     Update a Module
     */
    @CrossOrigin
    @PutMapping("/module")
    public ResponseEntity<Module> updateModule(@RequestBody Module module, @RequestParam(name = "sessionid") String sessionID)
    {

        User u = UserSessionIDHandler.getUserBySessionID(sessionID);
        if (u != null && u.getPermissions() == UserPermissions.admin.getValue())
        {
            Module m = db.updateModule(module);

            if (m != null)
            {
                return new ResponseEntity<>(m, HttpStatus.OK);
            }

            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }

    /**
    DELETE
    Delete A Module
     */
    @CrossOrigin
    @DeleteMapping("/module")
    public void deleteModule(@RequestParam(name = "sessionid") String sessionid, @RequestParam(name = "semesterid") int semesterid, @RequestParam(name = "userid") int userid)
    {
        User u = UserSessionIDHandler.getUserBySessionID(sessionid);
        if (u != null && u.getPermissions() == UserPermissions.admin.getValue())
        {
            db.deleteModule(semesterid, userid);
        }

    }
}
