package com.example.backend.anwprj.Semesters;

//semester data class
public class Semester
{
    private int id;
    private int startday;
    private int endday;
    private String name;
    private int startyear;
    private int endyear;

    public Semester(int id, int startday, int endday, String name, int startyear, int endyear) {
        this.id = id;
        this.startday = startday;
        this.endday = endday;
        this.name = name;
        this.startyear = startyear;
        this.endyear = endyear;
    }

    public int getId() {
        return id;
    }

    public int getStartday() {
        return startday;
    }

    public int getEndday() {
        return endday;
    }

    public String getName() {
        return name;
    }

    public int getStartyear() {
        return startyear;
    }

    public int getEndyear() {
        return endyear;
    }
}
