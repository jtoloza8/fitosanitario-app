const pool = require('../db/postgres');

const getLotes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lote')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getLoteById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM lote WHERE id_lote = $1', [id])
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lote no encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getLotesByLugar = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT * FROM lote WHERE id_lugar_produccion = $1', [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createLote = async (req, res) => {
  try {
    const { nombre_lote, area_ha, total_plantas_lote, especie, id_lugar_produccion } = req.body
    const result = await pool.query(
      `INSERT INTO lote (nombre_lote, area_ha, total_plantas_lote, especie, id_lugar_produccion)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre_lote, area_ha, total_plantas_lote, especie, id_lugar_produccion]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateLote = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre_lote, area_ha, total_plantas_lote, especie } = req.body
    const result = await pool.query(
      `UPDATE lote SET nombre_lote=$1, area_ha=$2, total_plantas_lote=$3, especie=$4
       WHERE id_lote=$5 RETURNING *`,
      [nombre_lote, area_ha, total_plantas_lote, especie, id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lote no encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteLote = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'DELETE FROM lote WHERE id_lote=$1 RETURNING *', [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lote no encontrado' })
    res.json({ mensaje: 'Lote eliminado correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getLotes, getLoteById, getLotesByLugar, createLote, updateLote, deleteLote }