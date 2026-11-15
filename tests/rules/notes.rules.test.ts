import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

const PROJECT_ID = 'db-ghichu'
const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 8080

const OWNER = 'user-a'
const OTHER = 'user-b'

let testEnv: RulesTestEnvironment

function noteData(overrides: Record<string, unknown> = {}) {
  return {
    userId: OWNER,
    title: 'Ghi chú của A',
    tabs: [{ id: 'tab-1', name: 'Tab 1', value: '', order: 0 }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  }
}

/** Seed a note directly, bypassing rules, so read/update/delete rules can be tested. */
async function seedNote(noteId: string, overrides: Record<string, unknown> = {}) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'notes', noteId), {
      userId: OWNER,
      title: 'Ghi chú của A',
      tabs: [{ id: 'tab-1', name: 'Tab 1', value: '', order: 0 }],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    })
  })
}

function dbAs(uid: string) {
  return testEnv.authenticatedContext(uid).firestore()
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: EMULATOR_HOST,
      port: EMULATOR_PORT,
      rules: readFileSync(path.resolve(import.meta.dirname, '../../firestore.rules'), 'utf8'),
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

describe('notes security rules — authentication', () => {
  it('blocks signed-out reads and writes', async () => {
    await seedNote('note-1')
    const anonymousDb = testEnv.unauthenticatedContext().firestore()

    await assertFails(getDoc(doc(anonymousDb, 'notes', 'note-1')))
    await assertFails(addDoc(collection(anonymousDb, 'notes'), noteData()))
  })
})

describe('notes security rules — ownership isolation', () => {
  it('lets the owner create, read, update and delete their own note', async () => {
    const ownerDb = dbAs(OWNER)

    const created = await assertSucceeds(addDoc(collection(ownerDb, 'notes'), noteData()))
    await assertSucceeds(getDoc(doc(ownerDb, 'notes', created.id)))
    await assertSucceeds(updateDoc(doc(ownerDb, 'notes', created.id), { title: 'Đã đổi tên' }))
    await assertSucceeds(deleteDoc(doc(ownerDb, 'notes', created.id)))
  })

  it('stops another user from reading, updating or deleting the note', async () => {
    await seedNote('note-1')
    const otherDb = dbAs(OTHER)

    await assertFails(getDoc(doc(otherDb, 'notes', 'note-1')))
    await assertFails(updateDoc(doc(otherDb, 'notes', 'note-1'), { title: 'Chiếm đoạt' }))
    await assertFails(deleteDoc(doc(otherDb, 'notes', 'note-1')))
  })

  it('stops another user from creating a note in the owner name', async () => {
    await assertFails(addDoc(collection(dbAs(OTHER), 'notes'), noteData({ userId: OWNER })))
  })

  it('stops the owner from handing the note to another user', async () => {
    await seedNote('note-1')

    await assertFails(updateDoc(doc(dbAs(OWNER), 'notes', 'note-1'), { userId: OTHER }))
  })

  it('rejects a list query that is not scoped to the owner', async () => {
    await seedNote('note-1')
    const ownerDb = dbAs(OWNER)

    // The rule reads resource.data.userId, so an unfiltered collection read must fail.
    await assertFails(getDocs(collection(ownerDb, 'notes')))
  })
})

describe('notes security rules — document shape limits', () => {
  it('rejects a title longer than 200 characters', async () => {
    const ownerDb = dbAs(OWNER)

    await assertFails(addDoc(collection(ownerDb, 'notes'), noteData({ title: 'a'.repeat(201) })))
  })

  it('rejects more than 30 tabs', async () => {
    const ownerDb = dbAs(OWNER)
    const tooManyTabs = Array.from({ length: 31 }, (_, index) => ({
      id: `tab-${index}`,
      name: `Tab ${index}`,
      value: '',
      order: index,
    }))

    await assertFails(addDoc(collection(ownerDb, 'notes'), noteData({ tabs: tooManyTabs })))
  })

  it('rejects a document missing required fields', async () => {
    const ownerDb = dbAs(OWNER)
    const withoutTitle: Record<string, unknown> = { ...noteData() }
    delete withoutTitle.title

    await assertFails(addDoc(collection(ownerDb, 'notes'), withoutTitle))
  })
})
