# csci3230-group-project

Group project for CSCI3230 Web Development at Ontario Tech University.

# Choosing a Topic

The project topic is, for the most part, up to you. The purpose of the project is to act like a final exam, demonstrating your mastery of the skills learned during this course. Therefore, it is essential that you choose a project topic that lets you demonstrate those skills. Consideration will be given to projects whose functionality is very different from sample applications and those developed in assignments in this course. When evaluating your project, I will consider this as requiring extra work. More work done often equates to a higher grade.

# Evaluation

## Objective Evaluation (10 marks)

This part of the evaluation will ensure that you have implemented all of the course concepts. To meet these criteria your project must contain a non-trivial amount of code that is not merely copied from the lab assignments (or from another source) that implements that course concept. To avoid any groups losing marks unnecessarily for this portion of the marking, a rubric has been provided in Table 2 (below):

| Requirement                   | Weight |
| ----------------------------- | ------ |
| SVG and HTML                  | 1.0    |
| CSS and CSS frameworks        | 1.0    |
| JavaScript, jQuery, D3        | 1.5    |
| Dynamic DOM                   | 1.5    |
| AJAX, web services            | 1.0    |
| Node.js/Express.js/Nuxt-nitro | 1.5    |
| Vue framework                 | 2.5    |

_Table 2. Objective grading criteria_

## Subjective Evaluation (20 marks)

This portion is an estimate of the quality and work done on the project. Factors considered include:

- Non-functional requirements: performance, security, look and feel, user friendliness, code quality, design, and architecture
- Functional requirements (e.g. how much work is done).

Grading rubric is presented in Table 3 (below):

| Requirement                        | Weight |
| ---------------------------------- | ------ |
| Code quality, design, architecture | 5.0    |
| User interface, usability          | 5.0    |
| Work done                          | 10.0   |

_Table 3. Subjective grading criteria_

> **Note:** This project will be treated as a final exam. Accordingly, the instructor will mark the subjective portion of the project quite strictly. It is expected that each student spends at least 30 hours on this project. Groups with more members, therefore, should have completed proportionally more work.

A working, production-ready website is a key criteria in the evaluation of your project. Specifically, if your web app cannot run, or breaks easily, will be weighted heavily in the grading evaluation.

## Promo video and additional topic (5 marks)

Each group will record a 3-5 minute promo video (`intro.mp4`) highlighting the features you implemented. Including this video is crucial: not all projects work "out of the box", and your video may be the only way that I can assess a functioning project. Be sure to demonstrate all of your web app's features in your video. Ensure the walk through is well-paced, and that each feature is given sufficient screen time.

You may find it helpful to write a short script before recording (e.g., 1. show login, 2. show search, 3. show dynamic table, etc.).

**Please choose a single member of your team to record the video walk-through.** It is not required nor preferable to have multiple students presenting in the video. However, if a student feels they can best present their own contribution, it's fine to have more than one speaker.

Ensure that each assessed technology component is shown and described in the video (e.g., web service, D3 graph, server).

Use a screen recording application rather than handheld phone video. You may use any tool you like. Free/open-source options include OBS and ShareX; watermarks from free-tier software are acceptable (e.g., CamStudio). Use standard codecs (H.264/H.265) to keep file size manageable. Verify that the recording resolution is sufficient to read the interface clearly.

Each group must include an additional technology not covered in lectures or labs. This can include Node.js packages, client-side tools, data stores, web services, or other tools not covered in the course. This portion must be highlighted in your video.

| Requirement                   | Weight |
| ----------------------------- | ------ |
| Introduction video            | 4.0    |
| Integration of new technology | 1.0    |

_Table 4. Grading rubric for intro video and new technology_

# Equal Distribution of Work

Include the file `contributions.txt` in your submission. It must list all group members and the elements/aspects each contributed. Students who contribute very little may be evaluated separately based on their individual contributions, and their marks will reflect this.

# Plagiarism

Any instances of plagiarism will result in a mark of **zero** for the project for the student(s) involved, and further disciplinary action will be taken. Plagiarism includes (but is not limited to):

- Copying of (any amount of) work from the Internet, without proper citation
- Submitting a body of work, cited or not, that is primarily not your own work
- Copying of (any amount of) work from another student, past or present, without proper citation
- Allowing your own work to be copied by a fellow student

All students involved with the submission of plagiarized code will be considered for an academic integrity violation.

> **Note:** Any cited code from another source will not be counted toward the work done, or toward completing any of the requirements for this project. You can include this code, if it helps round out your project, of course, but you will not get credit for someone else's work.

# Generative AI

Use of generative AI is prohibited for generating the core of your web project (e.g., "create a complete Vue project for a web store"). However, you are encouraged to use it for code optimization and problem solving (e.g., "show me the D3 equivalent of this jQuery statement"). Include relevant prompts in a separate file named `ai-prompts.txt`.

# How to Submit

As the due date approaches, prepare your application. Zip all contents and upload to Canvas. Include a file `readme.txt` with instructions on how to run your application (e.g., admin accounts, how to import the database, required files, etc.).

Ensure your video is included. If the application does not run "out of the box" in a reasonable amount of time, your video may be the only way the instructor can assess your project. If the instructor cannot run your project, you may lose marks.

> **Note:** If any required files or changes are missing from the upload at the time of submission, that work will not be counted toward your project mark.

## Upload requirements

When ready, the team leader will upload the submission to Canvas on behalf of the team. Your submission must be a single `.zip` file, and must include all required files listed below, along with all files needed to run your web app.

| File                 | Meaning                                                                    |
| -------------------- | -------------------------------------------------------------------------- |
| `group_members.html` | List of members in your group, with their BannerID                         |
| `contributions.txt`  | List of all group members, and their specific contributions to the project |
| `readme.txt`         | Instructions on how to run your web app                                    |
| `intro.mp4`          | Overview that shows your app running                                       |
| `ai-prompts.txt`     | A list of AI prompts used in the assignment                                |

_Table 6. Required files in your group submission_

# Ideas

- Budgeting app
  - Simple tracker/planner. Future enhancement possibility to add backend.
  - Pages
    - Dashboard
      - Expenses
      - Insights on dashboard data
      - Spending by timeline
        - Today's spending
        - This week
        - This month
        - Delta between current spending and a goal

    - Track money movement
      - Manual form
      - Scan a receipt\*
      - Subscriptions
    - Goals
      - What are categorical group spendings.
      - Set goals
      - Goal type
        - Savings
        - Spending
          - Categories
            - ...
        - Income?

- Layout
  - Navbar
