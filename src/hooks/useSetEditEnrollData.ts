//hooks/useSetEditEnrollData.ts
import { PerformanceData } from '@/app/api/performance/route';
import {  setEnrollEditData } from '@/redux/slices/enrollEditSlice';
import { SeatEditState, setSeatEditData } from '@/redux/slices/seatEditSlice';
import { EnrollStep } from '@/types/enrollment';
import { useDispatch } from "react-redux";


export default function useSetEditEnrollData() {
    
    const dispatch = useDispatch();
    
    const setEditEnrollData = (data : PerformanceData) => {
        const enrolldata = { ...data,id : data.id!, isDirty: false, step: EnrollStep.EnrollPerformance, invalidField: "", files: [] } 
        dispatch(setEnrollEditData(enrolldata))
    }

    const setEditSeatData = (data: SeatEditState) => {
        const seatData = { ...data, isDirty: false }
        dispatch(setSeatEditData(seatData))
    }
    return {setEditEnrollData ,setEditSeatData}
}
