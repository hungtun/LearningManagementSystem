package com.ou.LMS_Spring.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;


@RestController
public class PersonController {
    public record Person(String name, int age) {}
    
    @GetMapping("person/list")
    public List<Person> getPersons(){
        return List.of(
            new Person("Hung", 20),
            new Person("Lan", 21),
            new Person("Minh", 22)
        );
    }
}
