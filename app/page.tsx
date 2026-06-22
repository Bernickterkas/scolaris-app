'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

type Eleve = {
  id: number
  nom: string
  classe: string
  frais: number
  created_at?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Page() {
  const [eleves, setEleves] = useState<Eleve[]>([])
  const [nom, setNom] = useState('')
  const [classe, setClasse] = useState('')
  const [frais, setFrais] = useState('')

  useEffect(() => {
    const fetchEleves = async () => {
      const { data } = await supabase.from('eleves').select('*').order('id')
      setEleves(data || [])
    }
    fetchEleves()

    const channel = supabase
      .channel('eleves')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'eleves' },
        (payload) => {
          setEleves(current => [...current, payload.new as Eleve])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const ajouterEleve = async () => {
    if (nom && classe && frais) {
      await supabase.from('eleves').insert({
        nom: nom,
        classe: classe,
        frais: Number(frais)
      })
      setNom(''); setClasse(''); setFrais('')
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2 style={{ color: '#166e8f' }}>Scolaris - Gestion des Élèves</h2>
      <h3>MODULE 1 : Inscription des Élèves</h3>
     
      <input
        placeholder="Nom"
        value={nom}
        onChange={e => setNom(e.target.value)}
        style={{ marginRight: 10, padding: 5 }}
      />
      <input
        placeholder="Classe"
        value={classe}
        onChange={e => setClasse(e.target.value)}
        style={{ marginRight: 10, padding: 5 }}
      />
      <input
        placeholder="Frais"
        type="number"
        value={frais}
        onChange={e => setFrais(e.target.value)}
        style={{ marginRight: 10, padding: 5 }}
      />
      <button onClick={ajouterEleve} style={{ padding: 5 }}>Ajouter</button>

      <h4 style={{ marginTop: 20 }}>Liste des élèves :</h4>
      {eleves.map(eleve => (
        <div key={eleve.id} style={{ marginBottom: 5 }}>
          {eleve.nom} - {eleve.classe} - {eleve.frais}$
        </div>
      ))}
    </div>
  )
}