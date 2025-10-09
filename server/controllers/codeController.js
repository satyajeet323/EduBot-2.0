const { exec } = require("child_process");
const fs = require("fs-extra");
const { v4: uuid } = require("uuid");
const path = require("path");

const runCode = async (req, res) => {
  const { language, code } = req.body;
  const jobId = uuid();
  const folder = path.join(__dirname, `../temp/${jobId}`);
  await fs.ensureDir(folder); // create temp folder

  let fileName, runCmd;

  // Step 1: Choose language
  if (language === "python") {
    fileName = "script.py";
    await fs.writeFile(`${folder}/${fileName}`, code);
    runCmd = `docker run --rm -v "${folder}:/code" python:3.9 python /code/${fileName}`;
  } else if (language === "c") {
    fileName = "program.c";
    await fs.writeFile(`${folder}/${fileName}`, code);
    runCmd = `docker run --rm -v "${folder}:/code" gcc bash -c "gcc /code/${fileName} -o /code/a.out && /code/a.out"`;
  } else {
    return res.status(400).json({ error: "Language not supported" });
  }

  // Step 2: Run Docker command
  exec(runCmd, { timeout: 5000 }, (err, stdout, stderr) => {
    fs.remove(folder); // cleanup
    if (err) return res.json({ output: stderr || err.message });
    return res.json({ output: stdout });
  });
};

module.exports = { runCode };
