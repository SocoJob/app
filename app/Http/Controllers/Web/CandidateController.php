<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\AppBaseController;
use App\Models\Candidate;
use App\Repositories\Candidates\CandidateRepository;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CandidateController extends AppBaseController
{
    /** @var CandidateRepository */
    private $candidateRepository;

    public function __construct(CandidateRepository $candidateRepo)
    {
        $this->candidateRepository = $candidateRepo;
    }

    /**
     * @param $uniqueId
     *
     * @return Application|Factory|View
     */
    public function getCandidateDetails($uniqueId,$code=null)
    {
        $candidate = Candidate::whereUniqueId($uniqueId)->first();     
        $data = $this->candidateRepository->getCandidateDetail($candidate->id);
        $viewDetails = false;
        if($code == $candidate->token and $code != null){
            $viewDetails = true;
        }
        $candidate->token = null;
        $candidate->save();
        return view('front_web.candidate.candidate_details')->with($data)->with('view',$viewDetails);
    }

    /**
     * @param Request $request
     *
     * @return Application|Factory|View
     */
    public function getCandidatesLists(Request $request)
    {
        return view('front_web.candidate.index');
    }
}
