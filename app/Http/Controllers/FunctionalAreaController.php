<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateFunctionalAreaRequest;
use App\Http\Requests\UpdateFunctionalAreaRequest;
use App\Models\Candidate;
use App\Models\FunctionalArea;
use App\Models\Job;
use App\Repositories\FunctionalAreaRepository;
use Exception;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\View\View;

class FunctionalAreaController extends AppBaseController
{
    /** @var FunctionalAreaRepository */
    private $functionalAreaRepository;

    public function __construct(FunctionalAreaRepository $functionalAreaRepo)
    {
        $this->functionalAreaRepository = $functionalAreaRepo;
    }

    /**
     * Display a listing of the FunctionalArea.
     *
     * @param  Request  $request
     *
     * @return Factory|View
     */
    public function index()
    {
        return view('functional_areas.index');
    }

    /**
     * Store a newly created FunctionalArea in storage.
     *
     * @param  CreateFunctionalAreaRequest  $request
     *
     * @return JsonResponse
     */
    public function store(CreateFunctionalAreaRequest $request): JsonResponse
    {
        $input = $request->all();
        $functionalArea = $this->functionalAreaRepository->create($input);

        return $this->sendResponse($functionalArea,__('messages.flash.functional_area_save'));
    }

    /**
     * Show the form for editing the specified FunctionalArea.
     *
     * @param  FunctionalArea  $functionalArea
     *
     * @return JsonResponse
     */
    public function edit(FunctionalArea $functionalArea)
    {
        return $this->sendResponse($functionalArea, 'Functional Area successfully retrieved.');
    }

    /**
     * Update the specified FunctionalArea in storage.
     *
     * @param  FunctionalArea  $functionalArea
     * @param  UpdateFunctionalAreaRequest  $request
     *
     * @return JsonResponse
     */
    public function update(UpdateFunctionalAreaRequest $request, FunctionalArea $functionalArea)
    {
        $input = $request->all();
        $this->functionalAreaRepository->update($input, $functionalArea->id);

        return $this->sendSuccess(__('messages.flash.functional_area_update'));
    }

    /**
     * Remove the specified FunctionalArea from storage.
     *
     * @param  FunctionalArea  $functionalArea
     *
     * @throws Exception
     *
     * @return JsonResponse
     */
    public function destroy(FunctionalArea $functionalArea)
    {
        $Models = [
            Candidate::class,
            Job::class,
        ];
        $result = canDelete($Models, 'functional_area_id', $functionalArea->id);
        if ($result) {
            return $this->sendError(__('messages.flash.functional_area_cant_delete'));
        }
        $functionalArea->delete();

        return $this->sendSuccess(__('messages.flash.functional_area_delete'));
    }
}
