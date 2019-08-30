import { KeyPairKeyObjectResult } from 'crypto'
import * as firebase from 'firebase/app'
import moment from 'moment'
import React, { FC, useEffect, useState } from 'react'

import { QueryDocumentSnapshot } from '@google-cloud/firestore'

//import { firebase } from '../firebase'
import { collatedTasksExist } from '../helpers'

interface ProjectInterface {
  name: string
  projectid?: string
  userid?: string
  next?: any
  error?: any
  complete?: any
}

interface TasksInterface {
  archived?: boolean
  id?: string
  projectId?: string
  taskId?: string
  taskdate?: string
  taskdesc?: string
  taskname?: string
  userId?: string
}
export const useTasks = (selectedProject: string) => {
  const [tasks, setTasks] = useState([])
  const [archivedTasks, setArchivedTasks] = useState([])
  useEffect(() => {
    let unsubscribe: Partial<firebase.firestore.Query | any> = firebase
      .firestore()
      .collection('tasks')
      .where('userId', '==', '3XueJHiEDvXqB9PLmuM6AkRZExD3')

    unsubscribe =
      selectedProject && !collatedTasksExist(selectedProject)
        ? (unsubscribe = unsubscribe.where('projectid', '==', selectedProject))
        : selectedProject === 'TODAY'
        ? (unsubscribe = unsubscribe.where(
            'date',
            '==',
            moment().format('DD/MM/YYYY')
          ))
        : selectedProject === 'INBOX' || selectedProject === '0'
        ? (unsubscribe = unsubscribe.where('date', '==', ''))
        : unsubscribe
    unsubscribe = unsubscribe.onSnapshot(
      (snapshot: Partial<firebase.firestore.QuerySnapshot> | any) => {
        const newTasks = snapshot.docs.map(
          (task: firebase.firestore.QueryDocumentSnapshot) => ({
            id: task.id,
            ...task.data(),
          })
        )

        setTasks(
          selectedProject === 'NEXT_7'
            ? newTasks.filter(
                (task: TasksInterface) =>
                  moment(task.taskdate, 'DD-MM-YYYY').diff(moment(), 'days') <=
                    7 && task.archived !== true
              )
            : newTasks.filter((task: TasksInterface) => task.archived !== true)
        )

        setArchivedTasks(
          newTasks.filter((task: TasksInterface) => task.archived !== false)
        )
      }
    )
    return () => unsubscribe
  }, [selectedProject])

  return { tasks, archivedTasks }
}
export const useProjects = () => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    firebase
      .firestore()
      .collection('projects')
      .where('userId', '==', 'jlIFXIwyAL3tzHMtzRbw')
      .orderBy('projectId')
      .get()
      .then(snapshot => {
        const allProjects = snapshot.docs.map(project => ({
          ...project.data(),
          docId: project.id,
        }))

        if (JSON.stringify(allProjects) !== JSON.stringify(projects)) {
          setProjects(allProjects)
        }
      })
  }, [projects])

  return { projects, setProjects }
}
