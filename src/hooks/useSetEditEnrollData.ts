//hooks/useSetEditEnrollData.ts
import { PerformanceDataWithStatus } from '@/components/manager/Performance';
import { setEnrollEditData } from '@/redux/slices/enrollEditSlice';
import { EnrollStep } from '@/types/enrollment';
import { useDispatch } from "react-redux";

export default function useSetEditEnrollData(performanceData: PerformanceDataWithStatus) {
    
    const dispatch = useDispatch();
    
    const setEditEnrollData = () => {
        const { status, ...enrolldata } =  {...performanceData ,isDirty : false, step:EnrollStep.EnrollPerformance, invalidField : "" , files : [] } 
         dispatch(setEnrollEditData(enrolldata))
    }

    return {setEditEnrollData}
}
