'use client';

import { useEffect, useState } from 'react';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';
import Step5 from './step5';
import Step6 from './step6';
import Step7 from './step7';
import Step8 from './step8';
import Success from './success';
import { useSearchParams } from 'next/navigation';
import { SpaceDetailsInterface, useGetSpaceDetails } from '@/services';
import Step9 from './step9';
import { useSelector } from 'react-redux';
import { RootState, persistor } from '@/store/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function Page() {
    const searchParams = useSearchParams();
    const selectedCategoryId = useSelector((state: RootState) => state.spaceType.spaceId);

    const spaceId = searchParams.get('spaceId');
    const step = searchParams.get('step');
    const isEdit = searchParams.get('isEdit');

    const { data: spaceDetails } = useGetSpaceDetails(
        { spaceId: Number(spaceId) },
        {
            enabled: isEdit === 'true' && !!spaceId,
            queryKey: ['spaceDetails', Number(spaceId)],
        },
    );

    const response: SpaceDetailsInterface = spaceDetails?.data;

    // currentStep can be number or 'completed'
    const [currentStep, setCurrentStep] = useState<number | 'completed'>(
        step === 'completed' ? 'completed' : step ? Number(step) : 1,
    );

    useEffect(() => {
        if (step) {
            setCurrentStep(step === 'completed' ? 'completed' : Number(step));
        }
    }, [step, spaceId]);

    const stepComponents: Record<number | 'completed', any> = {
        1: (
            <Step1
                key={`step-1-${spaceId}`}
                isEdit={isEdit}
                editData={response}
                selectedCategoryId={selectedCategoryId}
            />
        ),
        2: (
            <Step2
                key={`step-2-${spaceId}`}
                isEdit={isEdit}
                editData={response}
                selectedCategoryId={selectedCategoryId}
            />
        ),
        3: <Step3 key={`step-3-${spaceId}`} isEdit={isEdit} editData={response} />,
        4: <Step4 key={`step-4-${spaceId}`} isEdit={isEdit} editData={response} />,
        5: <Step5 key={`step-5-${spaceId}`} isEdit={isEdit} editData={response} />,
        6: <Step6 key={`step-6-${spaceId}`} isEdit={isEdit} editData={response} />,
        7: <Step7 key={`step-7-${spaceId}`} isEdit={isEdit} editData={response} />,
        8: <Step8 key={`step-8-${spaceId}`} isEdit={isEdit} editData={response} />,
        9: <Step9 key={`step-9-${spaceId}`} isEdit={isEdit} editData={response} />,
        completed: <Success key={`step-completed-${spaceId}`} />,
    };

    return (
        <PersistGate loading={null} persistor={persistor}>
            <div className="mb-8">{stepComponents[currentStep]}</div>
        </PersistGate>
    );
}
