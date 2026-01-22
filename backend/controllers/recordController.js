import Farmer from '../models/Farmer.js';

import Record from '../models/Record.js'
// Fetch all records
export const getRecords = async (req, res) => {
  try {
    const records = await Record.find({ farmerId: req.user.id }).sort({ cultivationDate: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch records.' });
  }
};

// Add a new record
export const addRecord = async (req, res) => {
  try {
    const { crop, cultivationDate, quantity, description } = req.body;
    const record = await Record.create({
      farmerId: req.user.id,
      crop,
      cultivationDate,
      quantity,
      description,
    });
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to add record.' });
  }
};

export const getAllfarmer = async (req,res)=>{
  try{
    const users = await Farmer.find();
    return res.status(200).json(users)
  }catch(err){
    return res.status(500).send(err.message)
  }
}

export const deleteFarmer = async (req,res)=>{
  try{
    const email = req.params.email;
    const user = await Farmer.findOne({email:email})
    if(!user){
      return res.status(404).send("user not found")
    }
    await Farmer.findByIdAndDelete(user._id)
    return res.status(200).send("user deleted Sucessfully")
    
  }catch(err){
    return res.status(500).send(err.message)
  }
}

export const getAllCrop = async(req,res)=>{
  try{
    const crops = await Record.find()
    return res.status(200).send(crops)
  }catch(err){
    return res.status(500).send(err.message)
  }

}