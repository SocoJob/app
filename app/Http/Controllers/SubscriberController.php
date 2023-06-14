<?php

namespace App\Http\Controllers;

use App\Models\NewsLetter;
use Exception;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * Class SubscriberController
 */
class SubscriberController extends AppBaseController
{
    /**
     * @param Request $request
     *
     * @throws Exception
     *
     * @return Factory|View
     */
    public function index()
    {

        return view('subscribers.index');
    }

    /**
     * Remove the specified NewsLetter from storage.
     *
     * @param NewsLetter $newsLetter
     *
     * @throws Exception
     *
     * @return NewsLetter
     */
    public function destroy(NewsLetter $newsLetter)
    {
        $newsLetter->delete();

        return $this->sendSuccess(__('messages.flash.newsletter_delete'));
    }
}
