// firebase-tools refuses to start the Firestore emulator without Java 21+.
// This wrapper reuses JAVA_HOME when it is set, otherwise it falls back to the
// portable Temurin JRE kept in .tools/ (gitignored), so `npm run emulators`
// works on a machine that has no system-wide Java.
import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

const projectRoot = path.resolve(import.meta.dirname, '..')

function findPortableJavaHome() {
  const portableRoot = path.join(projectRoot, '.tools', 'jre21')
  if (!existsSync(portableRoot)) {
    return null
  }

  const [jdkDirectory] = readdirSync(portableRoot).filter((name) => name.startsWith('jdk-'))
  return jdkDirectory === undefined ? null : path.join(portableRoot, jdkDirectory)
}

const javaHome = process.env.JAVA_HOME ?? findPortableJavaHome()
if (javaHome === undefined || javaHome === null || !existsSync(javaHome)) {
  console.warn(
    '[emulators] Không tìm thấy Java 21+. Cài JDK/JRE 21 hoặc tải bản portable vào .tools/jre21.',
  )
} else {
  process.env.JAVA_HOME = javaHome
  process.env.PATH = `${path.join(javaHome, 'bin')}${path.delimiter}${process.env.PATH ?? ''}`
  console.log(`[emulators] Dùng Java tại ${javaHome}`)
}

const firebaseCli = path.join(projectRoot, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js')

const child = spawn(
  process.execPath,
  [firebaseCli, 'emulators:start', '--only', 'auth,firestore', ...process.argv.slice(2)],
  { cwd: projectRoot, stdio: 'inherit', env: process.env },
)

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
